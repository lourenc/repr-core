import { escapeSpecialCharacters } from './helpers';

import { SNAPSHOT_GRAPHQL_URL, SNAPSHOT_URL, TG_BOT_TOKEN } from './config';
import { ANSWER_CHOICES, PROPOSAL_INTRO } from './constants';

export interface Proposal {
  id: string;
  title: string;
  body: string;
  choices: string[];
  start: number;
  end: number;
  snapshot: string;
  space: {
    id: string;
    name: string;
  };
}

const PROPOSALS_QUERY = `query Proposals($spaces: [String]!){
  proposals (
    skip: 0,
    where: {
        space_in: $spaces,
        state: "active"
    },
    orderBy: "created",
    orderDirection: desc
  ) {
    id
    title
    body
    choices
    start
    end
    snapshot
    space {
      id
      name
    }
  }
}`;

export async function fetchProposals(spaces: string[]) {
  if (!spaces.length) {
    return [];
  }

  const response = await fetch(SNAPSHOT_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: PROPOSALS_QUERY,
      variables: {
        spaces: spaces,
      },
    }),
  }).then((res) => res.json());
  console.info('response', response);

  return response.data.proposals as Proposal[];
}

export function getProposalURL(
  proposal: Pick<Proposal, 'id'>,
  spaceId: string
) {
  return `${SNAPSHOT_URL}/#/${spaceId}/proposal/${proposal.id}`;
}

export function getProposalSummary(proposal: Proposal) {
  const url = getProposalURL(proposal, proposal.space.id);

  return `*Proposal:* ${escapeSpecialCharacters(
    proposal.title
  )}\n[Read more](${url})`;
}

export function prepareProposalPrompt(proposal: Proposal) {
  let proposalBody = PROPOSAL_INTRO;

  proposalBody += `Title: ${proposal.title}\n`;
  proposalBody += `Proposal: ${proposal.body}\n`;
  proposalBody += `Answer choices: ${proposal.choices.join('; ')}`;

  proposalBody += proposal.body + '\n';

  proposalBody += `\n${ANSWER_CHOICES}\n${proposal.choices.join('\n')}`;

  return escapeSpecialCharacters(proposalBody);
}
