import { Telegraf } from 'telegraf';

import { TG_BOT_TOKEN } from './config';
import { WELCOME_MESSAGE } from './constants';

export function bootstrapApp() {
  const bot = new Telegraf(TG_BOT_TOKEN);

  bot.start((ctx) => ctx.reply(WELCOME_MESSAGE));
  bot.launch();
}
