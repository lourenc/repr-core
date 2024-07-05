
const spaces: string[] = [ "repr.eth" ]
const handledProposals: string[] = []

const SNAPSHOT_GRAPHQL_URL = 'https://testnet.hub.snapshot.org/graphql'

const fetchNewProposalsQuery = 
    `query {
        proposals (
            first: 3,
            skip: 0,
            where: {
                space_in: ${JSON.stringify(spaces)},
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
    }`
export async function handle_proposal() {
    // handle proposal
    return true
}

export async function fetchNewProposals() {
    const response = await fetch(SNAPSHOT_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: fetchNewProposalsQuery,
            variables: {},
        })
    });
    // const response = await fetch(SNAPSHOT_GRAPHQL_URL, fetchNewProposalsQuery)
    // console.log(await response.text())
    const responseJson = await response.json()

    const proposals = responseJson.data.proposals

    const proposalTexts: string[] = []

    for (const proposal of proposals) {
        if (proposal in handledProposals) {
            continue
        }
        const ok = await handle_proposal()
        if (ok) {
            handledProposals.push(proposal)
        }

        proposalTexts.push(`*Proposal:* ${proposal.title}\n${proposal.body}\n*Answer choices:* ${proposal.choices.join(', ')}`)
    }

    return proposalTexts
}
