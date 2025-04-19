const UsersTableTestHelper = require('../UsersTableTestHelper');
const pool = require('../../src/Infrastructures/database/postgres/pool');
const bcrypt = require('bcrypt');

describe('ServerTestHelper (tanpa mock)', () => {
  const ServerTestHelper = require('../ServerTestHelper');

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should return existing userId if username already exists', async () => {
    const hashedPassword = await bcrypt.hash('secret', 10);

    await UsersTableTestHelper.addUser({
      id: 'user-existing',
      username: 'existinguser',
      password: hashedPassword,
      fullname: 'Test Existing',
    });

    const result = await ServerTestHelper.getAccessToken({
      id: 'user-xxx', // id diabaikan
      username: 'existinguser',
    });

    expect(result).toHaveProperty('userId', 'user-existing');
    expect(result).toHaveProperty('accessToken');
  });
});

describe('ServerTestHelper (mocked)', () => {
  beforeAll(() => {
    jest.resetModules(); // penting agar cache createServer hilang

    jest.mock('../../src/Infrastructures/http/createServer', () => {
      return () => ({
        inject: jest.fn().mockResolvedValue({
          statusCode: 500,
          payload: 'Internal Server Error',
        }),
      });
    });
  });

  it('should throw error if user creation fails unexpectedly', async () => {
    const ServerTestHelper = require('../ServerTestHelper'); // di-require setelah mock
    await expect(
      ServerTestHelper.getAccessToken({ id: 'fail-id', username: 'failuser' })
    ).rejects.toThrow('Gagal membuat user untuk test!');
  });
});

