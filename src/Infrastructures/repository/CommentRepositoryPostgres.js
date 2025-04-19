const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const { mapDBToCommentModel } = require('../utils');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, nanoid) {
    super();
    this._pool = pool;
    this._nanoid = nanoid;
  }

  async addComment({
    threadId, content, owner, date, isDeleted,
  }) {
    const id = `comment-${this._nanoid(6)}`;
    const query = {
      text: 'INSERT INTO comments (id, thread_id, owner, content, date, is_deleted) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, '
      + 'content, owner, thread_id AS "threadId", date, is_deleted AS "isDeleted"',
      values: [id, threadId, owner, content, date, isDeleted],
    };

    try {
      const result = await this._pool.query(query);
      return result.rows[0];
    } catch (error) {
      if (error.message.includes('fk_comments_thread_threads_id')) {
        throw new NotFoundError('THREAD_NOT_FOUND');
      }
      if (error.message.includes('fk_comments_owner_users')) {
        throw new NotFoundError('USER_NOT_FOUND');
      }
      throw error; // lemparkan kembali jika bukan FK error yang dikenali
    }
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_deleted = TRUE WHERE id = $1 RETURNING id',
      values: [commentId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('COMMENT_NOT_FOUND');
    }

    const comment = result.rows[0];
    if (comment.owner !== owner) {
      throw new AuthorizationError('NOT_COMMENT_OWNER');
    }
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `
        SELECT comments.id, comments.content, comments.date, comments.is_deleted AS "isDeleted", users.username 
        FROM comments
        JOIN users ON users.id = comments.owner
        WHERE comments.thread_id = $1
        ORDER BY comments.date ASC
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows.map(mapDBToCommentModel);
  }

  async verifyCommentExist(commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('COMMENT_NOT_FOUND');
    }
  }

  async verifyCommentBelongsToThread(commentId, threadId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1 AND thread_id = $2',
      values: [commentId, threadId],
    };
  
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('KOMENTAR_TIDAK_DITEMUKAN_DI_THREAD_INI');
    }
  }
  
}

module.exports = CommentRepositoryPostgres;
