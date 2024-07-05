
const spaces = []
const handledProposals = []

const fetchNewProposalsQuery = 
    `query {
        proposals (
        first: 1,
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

export async function fetchNewProposals(systemPrompt: string, proposalBody: string, choices: string[]) {    
    const response = await fetch('https://testnet.snapshot.org/graphql', fetchNewProposalsQuery)
    const proposals = await response.json()

    for (const proposal in proposals) {
        if (proposal in handledProposals) {
            continue
        }
        handle_proposal()
        handledProposals.push(proposal)
    }
}
