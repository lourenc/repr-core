import { Context, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

import { TG_BOT_TOKEN } from './config';
import { WELCOME_MESSAGE } from './constants';

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env['ANTHROPIC_API_KEY'],
});

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

  bot.command("ask_ai", async (ctx) => { return ctx.reply("lol"); })
  
  bot.on(message('text'), async (ctx) => {
    const message = await anthropic.messages.create({
      max_tokens: 1024,
      system: 'You are French translator. If it is the question, do not reply. Just provide the translation of the question to French',
      messages: [{ role: 'user', content: ctx.message.text }],
      model: 'claude-3-opus-20240229',
    });
  
    const text = message.content[0].text;
    return ctx.reply(text);
   });

  await bot.launch();
}
