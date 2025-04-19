const createServer = require('../createServer');
const container = require('../../container');

describe('HTTP server', () => {
  it('should response 404 when request unregistered route', async () => {
    // Arrange
    const server = await createServer(container);

    // Action
    const response = await server.inject({
      method: 'GET',
      url: '/unregisteredRoute',
    });

    // Assert
    expect(response.statusCode).toEqual(404);
  });

  it('should handle server error correctly', async () => {
    // 🛠️ Simulasi error dengan mockContainer
    const mockContainer = {
      getInstance: (name) => {
        if (name === 'AddUserUseCase') {
          throw new Error('Simulated error from container');
        }
        return {};
      },
    };

    // Arrange
    const requestPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'super_secret',
    };

    const server = await createServer(mockContainer);

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload: requestPayload,
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(500);
    expect(responseJson.status).toEqual('fail');
    expect(responseJson.message).toEqual('Terjadi kesalahan pada server kami');
  });
});
