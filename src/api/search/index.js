import { searchController } from '~/src/api/search/controller'

const search = {
  plugin: {
    name: 'search',
    register: async (server) => {
      server.route({
        method: 'POST',
        path: '/search',
        ...searchController
      })
    }
  }
}

export { search }
