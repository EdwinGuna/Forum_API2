/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const UsersTableTestHelper = {
  async addUser({
    id = 'user-123', username = 'dicoding', password = 'secret', fullname = 'Dicoding Indonesia',
  }) {
    const existingUsers = await this.findUsersById(id);
    if (existingUsers.length > 0) {
      // eslint-disable-next-line no-console
      return;
    }
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4)',
      values: [id, username, password, fullname],
    };

    await pool.query(query);
  },

  async findUsersById(id) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM users WHERE 1=1');
  },
};

module.exports = UsersTableTestHelper;
