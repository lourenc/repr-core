export const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN!;

if (!TG_BOT_TOKEN) {
  throw new Error('TG_BOT_TOKEN is not provided');
}

// export const PORT = integerWithFallback('PORT', 3000);
// export const HOST = process.env.HOST || '0.0.0.0';

// /* helpers */
// function integerWithFallback(key: string, defaultValue: number) {
//   const env = process.env[key];
//   return env ? parseInt(env) : defaultValue;
// }
