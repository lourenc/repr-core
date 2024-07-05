import { SNAPSHOT_GRAPHQL_URL } from './config'

const pokeASpaceQuery = 
    `query Space($space: String!){
         space(id: $space) {
          id
        }
    }`

export async function doesSpaceExist(name: string) {
    const response = await fetch(SNAPSHOT_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: pokeASpaceQuery,
            variables: {
                space: name,
            },
        })
    });

    const responseJson = await response.json()

    const exists =  responseJson.data.space !== null
    return exists
}
