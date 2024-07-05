import { Context, Markup, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

import { TG_BOT_TOKEN } from './config';
import { PROFILE_SETUP_COMPLETE_MESSAGE, WELCOME_MESSAGE } from './constants';

import {
  ChatState,
  STAGES,
  createInitialChatState,
  getPersistedState,
  persistState,
} from './state';
import { QUESTIONS_LIST, nextUnansweredQuestion } from './profile';
// import { attemptAnswer } from './ai';
import { fetchNewProposals } from './proposals';
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
      ctx.reply(proposal, { parse_mode: 'MarkdownV2' });
    }
    return;
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
