import { getCountries } from '~/src/api/search/helpers/search-mongodb'
import { createLogger } from '~/src/helpers/logging/logger'

const logger = createLogger()

const countryController = {
  handler: async (request, h) => {
    try {
      const result = await getCountries()
      return h.response({ countries: result }).code(200)
    } catch (error) {
      logger.error(`Failed to fetch countries' ${error}`)
      return h.response({ error: error.message }).code(500)
    }
  }
}

export { countryController }
