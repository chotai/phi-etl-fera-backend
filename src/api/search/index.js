import { searchController } from '~/src/api/search/controller'
import { countryController } from '~/src/api/search/country-controller'

const search = {
  plugin: {
    name: 'search',
    register: async (server) => 
    {
      server.route([
      {method: 'POST',
        path: '/search/plants',
        ...searchController
      },
      {
        method: 'GET',
        path: '/search/countries',
        ...countryController}
      ])
    }
  }
}

export { search }
