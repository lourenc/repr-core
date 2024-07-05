import { Context, Telegraf } from 'telegraf';
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
import { DEFAULT_PROFILE, nextUnansweredQuestion } from './profile';

interface BotContext extends Context {
  userState: ChatState;
}

export async function bootstrapApp() {
  const bot = new Telegraf(TG_BOT_TOKEN);

  // bot.use(async (ctx, next) => {
  //   ctx.state.
  // });
  bot.start(async (ctx) => {
    const initialState = createInitialChatState();

    await persistState(ctx.chat.id, initialState);

    return ctx.reply(WELCOME_MESSAGE);
  });

  bot.command('profile', async (ctx) => {
    const state = await getPersistedState(ctx.chat.id);

    state.profile = DEFAULT_PROFILE;
    state.stage = STAGES.PROFILE_SETUP;

    await persistState(ctx.chat.id, state);

    const question = nextUnansweredQuestion(state.profile);
    if (!question) {
      return ctx.reply('Your profile is already setup!');
    }

    return ctx.reply(question);
  });

  bot.on(message('text'), async (ctx) => {});

  await bot.launch();
}
