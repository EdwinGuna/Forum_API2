const { nanoid } = require('nanoid');
const createServer = require('../src/Infrastructures/http/createServer');
const container = require('../src/Infrastructures/container');
const pool = require('../src/Infrastructures/database/postgres/pool');

function validateLoginResponse(loginResponse) {
  const { data } = JSON.parse(loginResponse.payload);
  if (!data || loginResponse.statusCode !== 201) {
    throw new Error('Gagal mendapatkan accessToken. Pastikan username dan password sesuai.');
  }
  return data;
}

const ServerTestHelper = {
  /**
   * Mendapatkan accessToken dan userId untuk user tertentu.
   * Jika user belum ada, akan otomatis dibuat.
   */
  async getAccessToken({
    id = `user-${nanoid(6)}`,
    username = `user${nanoid(6)}`,
    password = 'secret',
  } = {}) {
    const server = await createServer(container);

    const userPayload = {
      id,
      username,
      fullname: 'Dicoding Indonesia',
      password,
    };

    // Tambah user
    const userResponse = await server.inject({
      method: 'POST',
      url: '/users',
      payload: userPayload,
    });

    let registeredUserId;

    if (userResponse.statusCode === 201) {
      const userResJson = JSON.parse(userResponse.payload);
      registeredUserId = userResJson.data.addedUser.id;
    } else if (userResponse.statusCode === 400 && userResponse.payload.includes('username')) {
      const result = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
      registeredUserId = result.rows[0].id;
    } else {
      throw new Error('Gagal membuat user untuk test!');
    }

    // Login untuk mendapatkan accessToken
    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username,
        password,
      },
    });

    const data = validateLoginResponse(loginResponse);

    return {
      accessToken: data.accessToken,
      username,
      userId: registeredUserId,
    };
  },

  // ⬇ Tambahkan untuk pengujian langsung
  _testOnly: {
    validateLoginResponse,
  },
};

module.exports = ServerTestHelper;
