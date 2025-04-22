const RepliesRepository = require('../../Domains/replies/RepliesRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const { mapDBToReplyModel } = require('../utils/index');

class RepliesRepositoryPostgres extends RepliesRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply({
    commentId, content, owner, date, isDeleted,
  }) {
    const id = `reply-${this._idGenerator()}`;
    const query = {
      text: `INSERT INTO replies (id, comment_id, content, owner, date, is_deleted) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, content, owner, comment_id AS "commentId"`,
      values: [id, commentId, content, owner, date, isDeleted],
    };

    const result = await this._pool.query(query);
    return new AddedReply(result.rows[0]);
  }

  async verifyReplyExist(replyId) {
    const query = {
      text: 'SELECT id, is_deleted FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Balasan tidak ditemukan');
    }

    if (result.rows[0].is_deleted) {
      throw new NotFoundError('Balasan telah dihapus');
    }
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Balasan tidak ditemukan');
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('REPLY_REPOSITORY.NOT_THE_OWNER');
    }
  }

  async deleteReplyById(replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted = TRUE WHERE id = $1 RETURNING id',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Balasan tidak ditemukan');
    }
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `SELECT 
              replies.id,
              replies.comment_id AS "commentId",
              replies.content,
              replies.date, 
              replies.is_deleted AS "isDeleted",
              users.username
             FROM replies
             JOIN users ON replies.owner = users.id
             WHERE replies.comment_id = $1
             ORDER BY replies.date ASC`,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rows.map(mapDBToReplyModel);
  }
}

module.exports = RepliesRepositoryPostgres;
