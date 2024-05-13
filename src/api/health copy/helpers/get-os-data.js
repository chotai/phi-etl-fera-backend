import { Client } from '@opensearch-project/opensearch'
import { config } from '~/src/config'

async function getDataFromOpenSearch(searchParams) {
  // Initialise OpenSearch Client
  const osClient = new Client({ node: config.get('openSearchUri') })

  // Build OpenSearch query from the request payload
  const query = {
    index: 'plant_details', //TODO: To be read from Config
    body: {
      query: {
        bool: {
          must: []
        }
      }
    }
  }

  // Add search parameters to query
  // TODO to be replaced with Actual ParamNames from Frontend
  // Repeat If condition for all params

  if (searchParams.latinName) {
    query.body.query.bool.must.push({
      match: { latinName: searchParams.latinName }
    })
  }
  if (searchParams.commonName) {
    query.body.query.bool.must.push({
      match: { common_name: searchParams.commonName }
    })
  }
  if (searchParams.synonym) {
    query.body.query.bool.must.push({
      match: { synonym_name: searchParams.synonym }
    })
  }

  let result
  try {
    const response = await osClient.search(query)
    return result = response.body.hits.hits.map((hit) => hit._source)
  } catch (error) {
    console.error('OpenSearch query failed, error')
    return new Error('search query failed')
  }
}

module.exports = { getDataFromOpenSearch }
