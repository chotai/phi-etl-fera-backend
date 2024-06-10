import { getCountries } from '~/src/api/search/helpers/search-mongodb'

let logger = ''

const countryController = {
  handler: async (request, h) => {
    try {
      logger = request.logger
      const result = await getCountries(logger)
      return h.response({ countries: result }).code(200)
    } catch (error) {
      // logger.error(`Failed to fetch countries' ${error}`)
      return h.response({ error: error.message }).code(500)
    }
  }
}

export { countryController }
