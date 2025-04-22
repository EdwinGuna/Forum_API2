/* eslint-disable no-console */
const { nanoid } = require('nanoid');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepositoryPostgres', () => {
  let commentRepositoryPostgres;
  let newComment;
  // Bersihkan tabel comments sebelum setiap test agar tidak ada data yang tersisa.
  beforeAll(async () => {
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

    const checkThread = await pool.query('SELECT id FROM threads WHERE id = $1', ['thread-123']);
    if (checkThread.rowCount === 0) {
    // Menambahkan thread terlebih dahulu sebelum menambahkan komentar
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123', owner: 'user-123', title: 'thread title', body: 'thread body',
      });
    } else {
      console.log('Thread sudah ada, tidak perlu ditambahkan lagi.');
    }
    console.log('Setup sebelum testing selesai.');
  });

  beforeEach(() => {
    commentRepositoryPostgres = new CommentRepositoryPostgres(pool, nanoid);
    newComment = {
      id: `comment-${nanoid(6)}`,
      threadId: 'thread-123',
      content: 'sebuah comment',
      owner: 'user-123',
      date: new Date().toISOString(),
      isDeleted: false,
    };
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment', () => {
    it('should persist new comment and return added comment correctly', async () => {
      const fakeIdGenerator = () => 'abc123';
      commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      // Act
      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      expect({
        ...addedComment,
        date: addedComment.date.toISOString(),
      }).toStrictEqual({
        id: 'comment-abc123',
        threadId: newComment.threadId,
        content: newComment.content,
        owner: newComment.owner,
        date: newComment.date,
        isDeleted: newComment.isDeleted,
      });

      const commentInDb = await CommentsTableTestHelper.getCommentById(addedComment.id);

      expect(commentInDb).toBeDefined();
      expect(commentInDb.id).toEqual(addedComment.id);
      expect(commentInDb.thread_id).toEqual(newComment.threadId);
      expect(commentInDb.content).toEqual(newComment.content);
      expect(commentInDb.owner).toEqual(newComment.owner);
      expect(commentInDb.date.toISOString().startsWith(newComment.date.slice(0, 19))).toBe(true);
      expect(commentInDb.is_deleted).toEqual(newComment.isDeleted);
    });

    it('should throw error when threadId not exist', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });

      await expect(commentRepositoryPostgres.addComment({
        threadId: 'thread-not-exist',
        content: 'sebuah comment',
        owner: 'user-123',
        date: new Date().toISOString(), // pastikan ini ada
        isDeleted: false,
      }))
        .rejects.toThrowError('THREAD_NOT_FOUND');
    });

    it('should throw the original error when it is not a known foreign key error', async () => {
      // Arrange
      const fakePool = {
        query: jest.fn(() => {
          throw new Error('some unexpected error');
        }),
      };

      const commentRepository = new CommentRepositoryPostgres(fakePool, () => '123456');

      // Action & Assert
      await expect(commentRepository.addComment({
        threadId: 'thread-123',
        content: 'some content',
        owner: 'user-123',
      })).rejects.toThrow('some unexpected error');
    });
  });

  describe('deleteComment', () => {
    it('should soft delete comment by updating is_deleted to true', async () => {
      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      // Act
      await commentRepositoryPostgres.deleteComment(addedComment.id);

      // Assert: menggunakan helper untuk mengambil komentar dan memeriksa field is_deleted
      const deletedComment = await CommentsTableTestHelper.getCommentById(addedComment.id);
      expect(deletedComment.is_deleted).toBe(true);
    });

    it('should throw NotFoundError when deleting a non-existing comment', async () => {
      // Act & Assert
      await expect(commentRepositoryPostgres.deleteComment('comment-not-exist'))
        .rejects.toThrowError('Komentar tidak ditemukan');
    });
  });

  describe('verifyCommentOwner', () => {
    it('should not throw error when owner matches', async () => {
      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      // Act & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(addedComment.id, 'user-123'))
        .resolves.not.toThrow(AuthorizationError);
    });

    it('should throw error when owner does not match', async () => {
      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      // Act & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(addedComment.id, 'user-999'))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should throw error when owner does not exist', async () => {
      const users = await pool.query('SELECT * FROM users');

      // Act & Assert
      await expect(commentRepositoryPostgres.addComment({
        threadId: 'thread-123',
        content: 'sebuah comment',
        owner: 'user-not-exist',
        date: new Date().toISOString(), // pastikan ini ada
        isDeleted: false,
      }))
        .rejects.toThrowError('USER_NOT_FOUND');
    });

    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepository = new CommentRepositoryPostgres(pool, () => '123');

      // Act & Assert
      await expect(commentRepository.verifyCommentOwner('comment-not-found', 'user-123'))
        .rejects.toThrowError(NotFoundError);
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should return array of comments for given thread sorted by date ascending', async () => {
      await CommentsTableTestHelper.cleanTable();
      // Arrange
      const comment1 = {
        id: 'comment-111',
        threadId: 'thread-123',
        content: 'Komentar pertama',
        owner: 'user-123',
        date: '2025-04-02T10:00:00.000Z',
        isDeleted: false,
      };

      const comment2 = {
        id: 'comment-222',
        threadId: 'thread-123',
        content: 'Komentar kedua',
        owner: 'user-123',
        date: '2025-04-02T10:01:00.000Z',
        isDeleted: false,
      };

      await CommentsTableTestHelper.addComment(comment1);
      await CommentsTableTestHelper.addComment(comment2);

      // Act
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      expect(comments).toHaveLength(2);

      // Komentar pertama
      expect(comments[0]).toEqual(expect.objectContaining({
        id: 'comment-111',
        content: 'Komentar pertama',
        date: new Date('2025-04-02T10:00:00.000Z'),
        username: 'dicoding',
        isDeleted: false,
      }));

      // Komentar kedua
      expect(comments[1]).toEqual(expect.objectContaining({
        id: 'comment-222',
        content: 'Komentar kedua',
        date: new Date('2025-04-02T10:01:00.000Z'),
        username: 'dicoding',
        isDeleted: false,
      }));

      // Pastikan terurut berdasarkan tanggal
      expect(new Date(comments[0].date).getTime())
        .toBeLessThan(new Date(comments[1].date).getTime());
    });
  });

  describe('verifyCommentExist', () => {
    it('should not throw error if comment exists', async () => {
      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      // Act & Assert
      await expect(commentRepositoryPostgres.verifyCommentExist(addedComment.id))
        .resolves.not.toThrowError(NotFoundError);
    });

    it('should throw error if comment does not exist', async () => {
      // Act & Assert
      await expect(commentRepositoryPostgres.verifyCommentExist('non-existent-comment'))
        .rejects.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentBelongsToThread', () => {
    it('should throw NotFoundError when comment does not belong to thread', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123', owner: 'user-123', title: 'thread123', body: 'ini isi dari thread123',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-999', owner: 'user-123', title: 'thread999', body: 'ini isi dari thread999',
      }); // thread lain
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      const repo = new CommentRepositoryPostgres(pool, () => '123');

      // Act & Assert
      await expect(repo.verifyCommentBelongsToThread('comment-123', 'thread-999'))
        .rejects.toThrowError('KOMENTAR_TIDAK_DITEMUKAN_DI_THREAD_INI');
    });

    it('should not throw error if comment belongs to thread', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123', owner: 'user-123', title: 'thread123', body: 'isi dari thread123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'test',
        owner: 'user-123',
      });

      const commentRepo = new CommentRepositoryPostgres(pool, () => '123');

      // Act & Assert
      await expect(
        commentRepo.verifyCommentBelongsToThread('comment-123', 'thread-123'),
      ).resolves.not.toThrow();
    });
  });
});
