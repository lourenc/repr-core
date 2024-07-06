import { db } from './db';
import { Profile } from './profile';

export const STAGES = {
  WELCOME: 'WELCOME',
  PROFILE_SETUP: 'PROFILE_SETUP',
  PROFILE_SETUP_FINISHED: 'PROFILE_SETUP_FINISHED',
  SPACE_SETUP: 'SPACE_SETUP',
  SPACE_SETUP_FINISHED: 'SPACE_SETUP_FINISHED',
  VOTING_SETUP: 'VOTING_SETUP',
  AWAITING_PROPOSALS: 'AWAITING_PROPOSALS',
} as const;

export type ChatState = {
  stage: keyof typeof STAGES;
  profile: Profile;
  knownProposalIds: string[];
  spaceId?: string;
};

/** something about data */
export function createInitialChatState() {
  return {
    stage: STAGES.WELCOME,
    profile: {},
    knownProposalIds: [],
  } as ChatState;
}

export function persistState(chatId: number, state: ChatState) {
  return db.put(`chat:${chatId}`, JSON.stringify(state));
}

export async function getPersistedState(chatId: number) {
  const stringifiedBytes = await db.get(`chat:${chatId}`);

  return JSON.parse(stringifiedBytes.toString()) as ChatState;
}
