const { nanoid } = require('nanoid');
const pool = require('../src/Infrastructures/database/postgres/pool');

module.exports = {

  async addComment({
    id = `comment-${nanoid(8)}`,
    threadId = 'thread-123',
    content = 'This is a test comment',
    owner = 'user-123',
    date = new Date().toISOString(),
    isDeleted = false,
  }) {
    // ✅ Periksa apakah user ada di database
    const existingUser = await pool.query('SELECT id FROM users WHERE id = $1', [owner]);
    if (existingUser.rowCount === 0) {
      throw new Error('USER_NOT_FOUND'); // 🔥 Hindari langsung error FK dari PostgreSQL
    }

    // ✅ Periksa apakah thread ada di database
    const existingThread = await pool.query('SELECT id FROM threads WHERE id = $1', [threadId]);
    if (existingThread.rowCount === 0) {
      throw new Error('THREAD_NOT_FOUND'); // 🔥 Hindari langsung error FK dari PostgreSQL
    }

    const query = {
      text: `
        INSERT INTO comments (id, thread_id, owner, content, date, is_deleted)
        VALUES($1, $2, $3, $4, $5, $6) RETURNING id, thread_id, content, owner, is_deleted
      `,
      values: [id, threadId, owner, content, date, isDeleted],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  async getCommentById(commentId) {
    const query = {
      text: 'SELECT id, thread_id, content, owner, date, is_deleted FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments');
  },
};
