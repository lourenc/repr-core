import { escapeSpecialCharacters } from './helpers';
import { SNAPSHOT_GRAPHQL_URL, SNAPSHOT_URL } from './config';
import { ANSWER_CHOICES, PROPOSAL_INTRO } from './constants';

const spaces: string[] = ['repr.eth'];

export interface Proposal {
  id: string;
  title: string;
  body: string;
  choices: string[];
  start: number;
  end: number;
  snapshot: string;
}

const fetchNewProposalsQuery = `query Proposals($amount: Int!, $spaces: [String]!){
  proposals (
    first: $amount,
    skip: 0,
    where: {
        space_in: $spaces,
        state: "started"
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
  }
}`;

export async function handle_proposal() {
  return true;
}

export async function fetchNewProposals() {
  const response = await fetch(SNAPSHOT_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: fetchNewProposalsQuery,
      variables: {
        spaces: spaces,
        amount: 1,
      },
    }),
  });

  const responseJson = await response.json();

  const proposals = responseJson.data.proposals;

  return proposals as Proposal[];
}

export function getProposalURL(proposal: Proposal, spaceId: string) {
  return `${SNAPSHOT_URL}/#/${spaceId}/proposal/${proposal.id}`;
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
