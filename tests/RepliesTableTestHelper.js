const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123',
    commentId = 'comment-123',
    content = 'Ini adalah balasan',
    owner = 'user-123',
    isDeleted = false,
    date = '2025-03-10T08:20:00.000Z', // ✨ string ISO UTC, bukan new Date()
  } = {}) {
    const query = {
      text: 'INSERT INTO replies (id, comment_id, content, owner, is_deleted, date) VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, commentId, content, owner, isDeleted, date],
    };

    await pool.query(query);
  },

  async findReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
