import { Context, Markup, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

import { TG_BOT_TOKEN } from './config';
import { PROFILE_SETUP_COMPLETE_MESSAGE, PROPOSAL_INTRO, PROPOSAL_SYSTEM_PROMPT, WELCOME_MESSAGE } from './constants';

import {
  ChatState,
  STAGES,
  createInitialChatState,
  getPersistedState,
  persistState,
} from './state';
import { QUESTIONS_LIST, nextUnansweredQuestion } from './profile';
import { attemptAnswer } from './ai';
import { Proposal, fetchNewProposals } from './proposals';
import { doesSpaceExist } from './spaces';

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

  bot.command('proposals', async (ctx) => {
    ctx.reply('Awaiting proposals');
    const proposals = await fetchNewProposals();
    for (const proposal of proposals) {
      let proposalText = (`*Proposal:* ${proposal.title}\n${proposal.body}\n*Answer choices:* ${proposal.choices.join(', ')}`)
      proposalText = escapeSpecialCharacters(proposalText);
      ctx.reply(proposalText, { parse_mode: 'MarkdownV2' });
    }

    const state = await getPersistedState(ctx.chat.id);
    
    const systemPrompt = generateProfileSystemPrompt(state);

    for (const proposal of proposals) {
      let proposalPrompt = prepareProposalPrompt(proposal);
      
      ctx.reply("*Asking AI the following:*\n" + proposalPrompt, { parse_mode: 'MarkdownV2' }); //DBG

      const response = await attemptAnswer(systemPrompt, proposalPrompt)
      
      ctx.reply(response)

      const answer = response.split("\n").pop().trim();
      ctx.reply("*Final answer:* " + answer, { parse_mode: 'MarkdownV2' });
    }


    return
  });

  bot.on(message('text'), async (ctx) => {
    const state = await getPersistedState(ctx.chat.id);

    switch (state.stage) {
      case STAGES.PROFILE_SETUP: {
        const unansweredQuestion = nextUnansweredQuestion(state.profile);
        if (!unansweredQuestion) {
          ctx.reply(PROFILE_SETUP_COMPLETE_MESSAGE);

          state.stage = STAGES.PROFILE_SETUP_FINISHED;
          return persistState(ctx.chat.id, state);
        }

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

          await persistState(ctx.chat.id, state);
          return ctx.reply('Hooray! Space setup is complete');
        }
      }
    }
  });

  await bot.launch();
}

function prepareProposalPrompt(proposal: Proposal) {
  let proposalBody = PROPOSAL_INTRO;

  proposalBody += "Title: " + proposal.title + "\n";

  proposalBody += "Proposal: " + proposal.body + "\n";

  // let choice = "x";
  proposalBody += `\nAnswer choices: ${proposal.choices.join('; ')}`;

  proposalBody = escapeSpecialCharacters(proposalBody);
  return proposalBody;
}

function generateProfileSystemPrompt(state: ChatState) {
  let systemPrompt = PROPOSAL_SYSTEM_PROMPT;
  for (const [que, ans] of Object.entries(state.profile)) {
    systemPrompt += `${que}: ${ans}\n`;
  }
  return systemPrompt;
}

function escapeSpecialCharacters(proposalText: string) {
  proposalText = proposalText.replace(/-/g, "\\-");
  proposalText = proposalText.replace(/\(/g, "\\(");
  proposalText = proposalText.replace(/\)/g, "\\)");
  proposalText = proposalText.replace(/\./g, "\\.");
  return proposalText;
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

    return ctx.reply(PROFILE_SETUP_COMPLETE_MESSAGE);
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
