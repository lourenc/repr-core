import { db } from './db';
import { DEFAULT_PROFILE, Profile } from './profile';

export const STAGES = {
  WELCOME: 'WELCOME',
  PROFILE_SETUP: 'PROFILE_SETUP',
  VOTING_SETUP: 'VOTING_SETUP',
} as const;

export type ChatState = {
  stage: keyof typeof STAGES;
  profile: Profile;
};

/** something about data */
export function createInitialChatState() {
  return {
    stage: STAGES.WELCOME,
    profile: DEFAULT_PROFILE,
  } as ChatState;
}

export function persistState(chatId: number, state: ChatState) {
  return db.put(`chat:${chatId}`, JSON.stringify(state));
}

export async function getPersistedState(chatId: number) {
  const stringifiedBytes = db.get(`chat:${chatId}`);

  return JSON.parse(stringifiedBytes.toString()) as Promise<ChatState>;
}
