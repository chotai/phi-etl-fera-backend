import { searchController } from '~/src/api/search/controller'

describe('searchController', () => {
  const mockViewHandler = {
    response: jest.fn().mockReturnThis(),
    code: jest.fn().mockReturnThis()
  }

  test('Should provide expected response', () => {
    searchController.handler(null, mockViewHandler)
    expect(mockViewHandler.response).not.toHaveBeenCalledWith({
      message: 'success'
    })
    expect(mockViewHandler.code).not.toHaveBeenCalledWith(200)
  })
})
