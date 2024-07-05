import { db } from './db';
import { Profile } from './profile';

export const STAGES = {
  WELCOME: 'WELCOME',
  PROFILE_SETUP: 'PROFILE_SETUP',
  VOTING_SETUP: 'VOTING_SETUP',
  AWAITING_PROPOSALS: 'AWAITING_PROPOSALS',
} as const;

export type ChatState = {
  stage: keyof typeof STAGES;
  profile: Profile;
};

/** something about data */
export function createInitialChatState() {
  return {
    stage: STAGES.WELCOME,
    profile: {},
  } as ChatState;
}

export function persistState(chatId: number, state: ChatState) {
  return db.put(`chat:${chatId}`, JSON.stringify(state));
}

export async function getPersistedState(chatId: number) {
  const stringifiedBytes = await db.get(`chat:${chatId}`);

  return JSON.parse(stringifiedBytes.toString()) as ChatState;
}
