import { Context, Markup, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

import { TG_BOT_TOKEN } from './config';
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
import { attemptAnswer } from './ai';
import { doesSpaceExist } from './spaces';
import {
  fetchProposals,
  getProposalSummary,
  prepareProposalPrompt,
} from './proposals';
import { pollSubscriptions, saveSubscription } from './subscriptions';

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
    state.stage = STAGES.PROFILE_SETUP;

    await persistState(ctx.chat.id, state);

    return askNextProfileQuestion(ctx, state);
  });

  bot.command('space', async (ctx) => {
    const state = await getPersistedState(ctx.chat.id);
    state.stage = STAGES.SPACE_SETUP;

    await persistState(ctx.chat.id, state);

    return ctx.reply('Please, provide the space ID:');
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

  // bot.action('profile', async (ctx) => {
  //   ctx.answer;
  // });

  bot.on(message('text'), async (ctx) => {
    const state = await getPersistedState(ctx.chat.id);

    switch (state.stage) {
      case STAGES.PROFILE_SETUP: {
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
      case STAGES.SPACE_SETUP: {
        const spaceId = ctx.message.text;
        const exists = await doesSpaceExist(spaceId);

        if (!exists) {
          return ctx.reply('This space does not exist. Please try again');
        } else {
          state.spaceId = spaceId;
          state.stage = STAGES.SPACE_SETUP_FINISHED;

          await saveSubscription(ctx.chat.id, spaceId);
          await persistState(ctx.chat.id, state);

          return ctx.reply('Hooray! Space setup is complete');
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
        stage: STAGES.PROFILE_SETUP_FINISHED,
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
