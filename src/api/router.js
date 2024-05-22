import { search } from '~/src/api/search'

const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      await server.register([search])
    }
  }
}

export { router }
