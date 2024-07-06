import { Context, Markup, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

import { SNAPSHOT_URL, TG_BOT_TOKEN } from './config';
import {
  PROFILE_SETUP_COMPLETE_MESSAGE,
  WELCOME_MESSAGE,
  SUMMARIZE_PERSONALITY,
} from './constants';

import {
  ChatState,
  STAGES,
  createInitialChatState,
  getPersistedState,
  persistState,
} from './state';
import {
  QUESTIONS_LIST,
  formQaList,
  generateProfileSystemPrompt,
  nextUnansweredQuestion,
} from './profile';
import {
  fetchProposals,
  getProposalSummary,
  getProposalURL,
  prepareProposalPrompt,
} from './proposals';

import { attemptAnswer } from './ai';
import { doesSpaceExist } from './spaces';
import { pollSubscriptions, saveSubscription } from './subscriptions';
import { base64ToHex } from './helpers';

import { generateNewSecretKey, getWallet, doVote } from './snapshot-api';

export async function bootstrapApp() {
  const bot = new Telegraf(TG_BOT_TOKEN);

  bot.start(async (ctx) => {
    const initialState = createInitialChatState();

    await persistState(ctx.chat.id, initialState);

    return ctx.reply(WELCOME_MESSAGE);
  });

  bot.command('profile', async (ctx) => {
    const state = await getPersistedState(ctx.chat.id);
    state.profile = {};
    state.stage = STAGES.AWAITING_PROFILE_SETUP;

    await persistState(ctx.chat.id, state);

    return askNextProfileQuestion(ctx, state);
  });

  bot.command('space', async (ctx) => {
    const state = await getPersistedState(ctx.chat.id);
    state.stage = STAGES.AWAITING_SPACE_SETUP;

    await persistState(ctx.chat.id, state);

    return ctx.reply('Please, provide the space ID:');
  });

  bot.command('delegate', async (ctx) => {
    const state = await getPersistedState(ctx.chat.id);

    if (!state.delegateKey) {
      state.delegateKey = generateNewSecretKey() as `0x${string}`;

      await persistState(ctx.chat.id, {
        ...state,
        delegatedAt: Date.now(),
        stage: STAGES.AWAITING_PROPOSALS,
      });

      ctx.reply('New address created!');
    }

    const wallet = getWallet(state.delegateKey);
    const address = wallet.account!.address;
    return ctx.reply(
      `Assign delegation rights using link [here](${SNAPSHOT_URL}/#/delegate/${state.spaceId}/${address})`,
      { parse_mode: 'MarkdownV2' }
    );
  });

  bot.command('sumup', async (ctx) => {
    ctx.reply('Summarizing personality');

    const state = await getPersistedState(ctx.chat.id);
    const qa = formQaList(state);

    const response = await attemptAnswer(SUMMARIZE_PERSONALITY, qa);

    return ctx.reply(response);
  });

  bot.command('info', async (ctx) => {
    const state = await getPersistedState(ctx.chat.id);
    const qa = formQaList(state);
    ctx.reply(qa);

    ctx.reply(
      state.spaceId
        ? `Currently connected space: ${state.spaceId}`
        : 'No space ID set'
    );

    return;
  });

  bot.command('proposals', async (ctx) => {
    const state = await getPersistedState(ctx.chat.id);
    if (!state.spaceId) {
      return ctx.reply('Please set up your space first');
    }

    const systemPrompt = generateProfileSystemPrompt(state);

    ctx.reply('Fetchin unhandled proposals');
    const proposals = await fetchProposals([state.spaceId]);

    for (const proposal of proposals) {
      const proposalSummary = getProposalSummary(proposal);
      ctx.reply(proposalSummary, { parse_mode: 'MarkdownV2' });

      const proposalPrompt = prepareProposalPrompt(proposal);
      const response = await attemptAnswer(systemPrompt, proposalPrompt);
      ctx.reply(response);

      const answer = (response.split('\n').pop() as string).trim();
      ctx.reply('*Extracted answer:* ' + answer, { parse_mode: 'MarkdownV2' });
    }

    return;
  });

  bot.action(/vote-(.+)-(\d)/, async (ctx) => {
    const proposalId: `0x${string}` = `0x${base64ToHex(ctx.match[1])}`;
    const choice = parseInt(ctx.match[2]);

    const chatId = ctx.chat?.id;

    if (!chatId) {
      // couldn't happen probably but typescript is not smart enough
      return ctx.answerCbQuery(`Could not find chat ID`);
    }

    const state = await getPersistedState(ctx.chat.id);

    const wallet = getWallet(state.delegateKey!);
    const result = await doVote(wallet, proposalId, choice + 1, state.spaceId!);

    console.log('delegate addr', wallet.account!.address);
    console.log('choice', choice, 'proposalId', proposalId);

    ctx.reply(JSON.stringify(result));

    state.stage = STAGES.AWAITING_PROPOSALS;
    await persistState(ctx.chat.id, state);

    ctx.answerCbQuery(`Voting for proposal ${proposalId}, choice ${choice}`);
  });

  bot.action(/ignore-(.+)/, async (ctx) => {
    const proposalId = `0x${base64ToHex(ctx.match[1])}`;
    const chatId = ctx.chat?.id;

    if (!chatId) {
      // couldn't happen probably but typescript is not smart enough
      return ctx.answerCbQuery(`Could not find chat ID`);
    }

    const state = await getPersistedState(ctx.chat.id);
    state.stage = STAGES.AWAITING_PROPOSALS;
    await persistState(ctx.chat.id, state);

    try {
      await ctx.answerCbQuery(`Ignoring proposal ${proposalId}`);
      await ctx.editMessageReplyMarkup(Markup.removeKeyboard() as any);
    } catch (e) {
      console.error(e);
    }

    ctx.reply(
      `<a href="${getProposalURL(
        { id: proposalId },
        state.spaceId!
      )}">Proposal</a> ignored 💩`,
      {
        parse_mode: 'HTML',
      }
    );
  });

  bot.on(message('text'), async (ctx) => {
    const state = await getPersistedState(ctx.chat.id);

    switch (state.stage) {
      case STAGES.AWAITING_PROFILE_SETUP: {
        const unansweredQuestion = nextUnansweredQuestion(state.profile)!;
        const expectedAnswers = QUESTIONS_LIST[unansweredQuestion];
        if (!expectedAnswers.includes(ctx.message.text)) {
          return ctx.reply(
            `Please select one of the following options: ${expectedAnswers.join(
              ', '
            )}`
          );
        }

        state.profile[unansweredQuestion] = ctx.message.text;

        await persistState(ctx.chat.id, state);
        return askNextProfileQuestion(ctx, state);
      }
      case STAGES.AWAITING_SPACE_SETUP: {
        const spaceId = ctx.message.text;
        const exists = await doesSpaceExist(spaceId);

        if (!exists) {
          return ctx.reply('This space does not exist. Please try again');
        } else {
          state.spaceId = spaceId;
          state.stage = STAGES.AWAITING_DELEGATION;

          state.knownProposalIds = [];

          await saveSubscription(ctx.chat.id, spaceId);
          await persistState(ctx.chat.id, state);

          return ctx.reply('Hooray! Space setup is complete. Now /delegate');
        }
      }
    }
  });

  setTimeout(async function loop() {
    await pollSubscriptions(bot);

    setTimeout(loop, 10000);
  });

  await bot.launch();
}

async function askNextProfileQuestion(ctx: Context, state: ChatState) {
  const question = nextUnansweredQuestion(state.profile);
  if (!question) {
    if (ctx.chat?.id) {
      await persistState(ctx.chat.id, {
        ...state,
        stage: STAGES.AWAITING_PROPOSALS,
      });
    }

    return ctx.reply(PROFILE_SETUP_COMPLETE_MESSAGE, Markup.removeKeyboard());
  }

  return ctx.reply(
    question,
    Markup.keyboard(
      QUESTIONS_LIST[question].map((answer) => ({ text: answer })),
      {
        columns: 3,
      }
    )
      .oneTime(true)
      .resize(true)
  );
}
