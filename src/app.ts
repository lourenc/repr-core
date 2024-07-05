import { Telegraf, Markup, Context } from 'telegraf';
import { message } from 'telegraf/filters';

import { TG_BOT_TOKEN } from './config';
import { WELCOME_MESSAGE } from './constants';

import {
  ChatState,
  STAGES,
  createInitialChatState,
  getPersistedState,
  persistState,
} from './data';
import { QUESTIONS_LIST, nextUnansweredQuestion } from './profile';
import { attemptAnswer } from './ai';
import { fetchNewProposals } from './proposals';

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

  bot.command('vote', async (ctx) => {
    const state = await getPersistedState(ctx.chat.id);

    // if (state.stage != STAGES.AWAITING_PROPOSALS) {
    const systemPrompt = 'You are French translator. If it is the question, do not reply. Just provide the translation of the question to French'

    const answer = await attemptAnswer(systemPrompt, "What is the meaning of life?", ["42", "Something else"])
      // return attemptAnswer()
    // }
    return ctx.reply(answer);
  });

  bot.command('proposals', async (ctx) => {
    ctx.reply("Awaiting proposals");
    const proposals = await fetchNewProposals();
    for (const proposal of proposals) {
      ctx.reply(proposal, { parse_mode: 'MarkdownV2' });
    }
    return
  });

  bot.on(message('text'), async (ctx) => {
    const state = await getPersistedState(ctx.chat.id);

    switch (state.stage) {
      case STAGES.PROFILE_SETUP: {
        const question = nextUnansweredQuestion(state.profile);
        if (!question) {
          ctx.reply('Your profile is already setup!');

          return persistState(ctx.chat.id, {
            ...state,
            stage: STAGES.AWAITING_PROPOSALS,
          });
        }

        if (!QUESTIONS_LIST[question].includes(ctx.message.text)) {
          return ctx.reply(
            `Please select one of the following options: ${QUESTIONS_LIST[
              question
            ].join(', ')}`
          );
        }

        state.profile[question] = ctx.message.text;

        await persistState(ctx.chat.id, state);
        return askNextProfileQuestion(ctx, state);
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

    return ctx.reply('Your profile is already setup!');
  }

  return ctx.reply(
    question,
    Markup.keyboard(
      QUESTIONS_LIST[question].map((answer) => ({ text: answer })),
      {
        columns: 2,
      }
    )
      .oneTime(true)
      .resize(true)
  );
}
