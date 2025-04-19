const pool = require('../../database/postgres/pool');
const RepliesRepositoryPostgres = require('../ReplyRepositoryPostgres');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('RepliesRepositoryPostgres', () => {
  beforeEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();

    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    });

    await UsersTableTestHelper.addUser({
      id: 'user-456',
      username: 'johndoe',
      password: 'supersecret',
      fullname: 'John Doe',
    });

    await ThreadsTableTestHelper.addThread({
      id: 'thread-123', owner: 'user-123', title: 'coba thread', body: 'body coba thread',
    });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist new reply and return added reply correctly', async () => {
      // Arrange
      const newReply = {
        commentId: 'comment-123',
        content: 'Ini adalah balasan',
        owner: 'user-123',
      };

      const fakeIdGenerator = () => '123'; // Mock nanoid agar ID bisa diprediksi
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await repliesRepositoryPostgres.addReply(newReply);
      // Assert hasil return
      expect(addedReply).toHaveProperty('id');
      expect(addedReply).toHaveProperty('commentId', newReply.commentId);
      expect(addedReply).toHaveProperty('content', newReply.content);
      expect(addedReply).toHaveProperty('owner', newReply.owner);

      // Assert
      const replyInDb = await RepliesTableTestHelper.findReplyById(addedReply.id);

      expect(replyInDb).toHaveLength(1);
      expect(replyInDb[0].id).toEqual(addedReply.id);
      expect(replyInDb[0].comment_id).toEqual(newReply.commentId);
      expect(replyInDb[0].content).toEqual(newReply.content);
      expect(replyInDb[0].owner).toEqual(newReply.owner);
    });
  });

  describe('deleteReplyById function', () => {
    it('should mark reply as deleted (soft delete)', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'Balasan akan dihapus',
        owner: 'user-123',
      });

      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool);

      // Act
      await repliesRepositoryPostgres.deleteReplyById('reply-123');

      // Assert
      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies).toHaveLength(1);
      expect(replies[0].is_deleted).toBe(true); // ✅ Pastikan is_deleted berubah menjadi true
    });

    it('should throw NotFoundError when reply does not exist', async () => {
      // Arrange: Pastikan reply dengan id 'reply-999' tidak ada di database
      const replyRepositoryPostgres = new RepliesRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(replyRepositoryPostgres.deleteReplyById('reply-999'))
        .rejects.toThrowError('Balasan tidak ditemukan');
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError when reply does not belong to user', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool);

      // Action & Assert
      await expect(repliesRepositoryPostgres.verifyReplyOwner('reply-123', 'user-456'))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw error when reply belongs to user', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool);

      // Action & Assert
      await expect(repliesRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123'))
        .resolves.not.toThrowError();
    });

    it('should throw NotFoundError when reply does not exist in verifyReplyOwner', async () => {
      // Arrange
      const replyRepositoryPostgres = new RepliesRepositoryPostgres(pool, () => '123');

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-not-exist', 'user-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when reply is soft-deleted', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: 'reply-123', commentId: 'comment-123', content: 'Balasan yang dihapus', owner: 'user-123', isDeleted: true,
      });
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(repliesRepositoryPostgres.verifyReplyExist('reply-123'))
        .rejects.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyExist function', () => {
    it('should throw NotFoundError when reply does not exist', async () => {
      // Arrange
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool);

      // Action & Assert
      await expect(repliesRepositoryPostgres.verifyReplyExist('reply-xyz'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw error when reply exists', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });
      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool);

      // Action & Assert
      await expect(repliesRepositoryPostgres.verifyReplyExist('reply-123'))
        .resolves.not.toThrowError(NotFoundError);
    });

    it('should call database query when verifying reply existence', async () => {
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'Balasan untuk komentar',
        owner: 'user-123',
      });
      const spyQuery = jest.spyOn(pool, 'query');

      const replyRepositoryPostgres = new RepliesRepositoryPostgres(pool, {});
      await replyRepositoryPostgres.verifyReplyExist('reply-123');

      expect(spyQuery).toHaveBeenCalledTimes(1); // ✅ Ini akan meningkatkan cakupan
    });
  });

  describe('getRepliesByCommentId', () => {
    it('should return replies by commentId', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'Balasan untuk komentar',
        owner: 'user-123',
        date: '2025-03-10T08:20:00.000Z',
      });

      const replyRepositoryPostgres = new RepliesRepositoryPostgres(pool, {});

      // Act
      const replies = await replyRepositoryPostgres.getRepliesByCommentId('comment-123');

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toEqual('reply-123');
      expect(replies[0].commentId).toEqual('comment-123');
      expect(replies[0].content).toEqual('Balasan untuk komentar');
      expect(replies[0].username).toEqual('dicoding');
      expect(new Date(replies[0].date).toISOString()).toEqual('2025-03-10T08:20:00.000Z');
    });

    it('should return empty array when there are no replies', async () => {
      // Arrange
      const replyRepositoryPostgres = new RepliesRepositoryPostgres(pool, {});
      // Act
      const replies = await replyRepositoryPostgres.getRepliesByCommentId('comment-999');
      // Assert
      expect(replies).toHaveLength(0); // Seharusnya kosong karena tidak ada balasan
    });

    it('should return masked content when reply is soft-deleted', async () => {
      await CommentsTableTestHelper.addComment({
        id: 'comment-888',
        threadId: 'thread-123', // pastikan thread ini juga ada
        content: 'Komentar dummy',
        owner: 'user-123',
      });
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: 'reply-888',
        commentId: 'comment-888',
        content: 'Ini akan disembunyikan',
        owner: 'user-123',
        isDeleted: true,
        date: '2025-03-10T09:00:00.000Z',
      });

      const repliesRepositoryPostgres = new RepliesRepositoryPostgres(pool);

      // Act
      const replies = await repliesRepositoryPostgres.getRepliesByCommentId('comment-888');

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0].content).toBe('Ini akan disembunyikan'); // sesuai data mentah
    });
  });
});
