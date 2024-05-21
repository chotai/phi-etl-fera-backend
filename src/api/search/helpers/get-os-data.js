import { Client } from '@opensearch-project/opensearch'
import { createLogger } from '~/src/helpers/logging/logger'
import { config } from '~/src/config'

const logger = createLogger()

async function getDataFromOpenSearch(searchParams) {
  // Initialise OpenSearch Client
  const osClient = new Client({ node: config.get('openSearchUri') })

  // Build OpenSearch query from the request payload
  const query = {
    index: 'plant_details', // TODO: To be read from Config
    body: {
      query: {
        bool: {
          should: []
        }
      }
    }
  }

  // Add search parameters to query
  // TODO to be replaced with Actual ParamNames from Frontend
  // Repeat If condition for all params, as necessary
  // TODO: Refine the search criteria, (to be done in iternations)

  if (searchParams.searchtext) {
    query.body.query.bool.should.push({
      match: { latinname: searchParams.searchtext }
    })

    query.body.query.bool.should.push({
      match: { common_name: searchParams.searchtext }
    })

    query.body.query.bool.should.push({
      match: { synonym_name: searchParams.searchtext }
    })
  }

  try {
    const response = await osClient.search(query)
    return response.body.hits.hits.map((hit) => hit._source)
  } catch (error) {
    logger.error('OpenSearch query failed, error')
    return new Error('search query failed')
  }
}

module.exports = { getDataFromOpenSearch }
