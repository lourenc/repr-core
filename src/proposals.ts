import { SNAPSHOT_GRAPHQL_URL } from './config';

const spaces: string[] = ['repr.eth'];
const handledProposals: string[] = [];

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
  // handle proposal
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
