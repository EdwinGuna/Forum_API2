const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadsTableTestHelper = {
  async addThread(threadData) {
    // 🔍 Periksa apakah semua properti tersedia
    const requiredProperties = ['id', 'title', 'body', 'owner'];
    const missingProperties = requiredProperties.filter((prop) => !threadData[prop]);

    if (missingProperties.length > 0) {
      throw new Error(`Missing properties: ${missingProperties.join(', ')}`);
    }

    const {
      id, title, body, owner,
    } = threadData;

    const query = {
      text: 'INSERT INTO threads (id, title, body, owner, date) VALUES($1, $2, $3, $4, NOW())',
      values: [id, title, body, owner],
    };
    await pool.query(query);
  },

  async findThreadById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM threads WHERE 1=1');
  },
};

module.exports = ThreadsTableTestHelper;
