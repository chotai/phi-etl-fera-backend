import { openSearchController } from '~/src/api/openSearch/controllers'

const openSearch = {
  plugin: {
    name: 'openSearch',
    register: async (server) => {
      server.route({
        method: 'POST',
        path: '/search',
        ...openSearchController
      })
    }
  }
}

export { openSearch }
