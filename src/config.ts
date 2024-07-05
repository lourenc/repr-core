export const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN!;

export const SNAPSHOT_GRAPHQL_URL =
  process.env.SNAPSHOT_GRAPHQL_URL ||
  'https://testnet.hub.snapshot.org/graphql';

export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

if (!TG_BOT_TOKEN) {
  throw new Error('TG_BOT_TOKEN is not provided');
}

if (!ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not provided');
}
