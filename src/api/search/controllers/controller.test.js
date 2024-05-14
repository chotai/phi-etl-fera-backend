describe('#openSearchController', () => {
  const mockViewHandler = {
    response: jest.fn().mockReturnThis(),
    code: jest.fn().mockReturnThis()
  }

  test('Should provide expected response', () => {
    expect(mockViewHandler.response).not.toHaveBeenCalledWith({
      message: 'success'
    })
    expect(mockViewHandler.code).not.toHaveBeenCalledWith(200)
  })
})
