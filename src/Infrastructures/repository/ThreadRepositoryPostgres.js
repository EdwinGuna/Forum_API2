const { nanoid } = require('nanoid');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const { mapDBToThreadModel } = require('../utils');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool) {
    super();
    this._pool = pool;
  }

  async addThread(newThread) {
    const { title, body, owner } = newThread;
    const id = `thread-${nanoid(8)}`;

    try {
      const query = {
        text: 'INSERT INTO threads (id, title, body, owner) VALUES ($1, $2, $3, $4) RETURNING id, title, owner, body',
        values: [id, title, body, owner],
      };

      const result = await this._pool.query(query);
      return result.rows[0];
    } catch (error) {
      throw new InvariantError('Gagal menambahkan thread ke database');
    }
  }

  async getThreadById(threadId) {
    const query = {
      text: `
        SELECT threads.id, threads.title, threads.body, threads.date, users.username
        FROM threads
        JOIN users ON users.id = threads.owner
        WHERE threads.id = $1
      `,
      values: [threadId],
    };

    const threadResult = await this._pool.query(query);

    if (!threadResult.rowCount) {
      throw new NotFoundError('Thread tidak ditemukan');
    }

    return mapDBToThreadModel(threadResult.rows[0]);
  }

  async verifyAvailableThread(threadId) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Thread tidak ditemukan');
    }
  }
}

module.exports = ThreadRepositoryPostgres;
