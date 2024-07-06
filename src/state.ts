import { db } from './db';
import { Profile } from './profile';

export const STAGES = {
  WELCOME: 'WELCOME',
  AWAITING_PROFILE_SETUP: 'AWAITING_PROFILE_SETUP',
  AWAITING_SPACE_SETUP: 'AWAITING_SPACE_SETUP',
  AWAITING_DELEGATION: 'AWAITING_DELEGATION',
  AWAITING_PROPOSALS: 'AWAITING_PROPOSALS',
  AWAITING_USER_DECISION: 'AWAITING_USER_DECISION',
} as const;

export type ChatState = {
  stage: keyof typeof STAGES;
  profile: Profile;
  knownProposalIds: string[];
  spaceId?: string;
  delegateKey?: `0x${string}`;
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
