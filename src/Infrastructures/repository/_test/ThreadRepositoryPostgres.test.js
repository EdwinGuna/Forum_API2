const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.addUser({ id: 'user-123' }); // Pastikan user ada sebelum thread dibuat
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should throw InvariantError when database query fails', async () => {
      // Arrange: Simulasikan kesalahan database
      const threadRepository = new ThreadRepositoryPostgres(pool, () => '123');
      jest.spyOn(pool, 'query').mockRejectedValueOnce(new InvariantError('database error'));

      // Action & Assert
      await expect(threadRepository.addThread({
        title: 'Thread Error',
        body: 'Thread ini error',
        owner: 'user-123',
      })).rejects.toThrowError(InvariantError);
    });

    it('should persist new thread and return added thread correctly', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);
      const newThread = {
        title: 'Thread Baru',
        body: 'Isi thread ini sangat menarik',
        owner: 'user-123',
      };

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      // Assert hasil return
      expect(addedThread).toHaveProperty('id');
      expect(addedThread).toHaveProperty('title', newThread.title);
      expect(addedThread).toHaveProperty('body', newThread.body);
      expect(addedThread).toHaveProperty('owner', newThread.owner);

      // Assert bahwa data benar-benar tersimpan di DB
      const threadInDb = await ThreadsTableTestHelper.findThreadById(addedThread.id);

      expect(threadInDb).toHaveLength(1);
      expect(threadInDb[0].id).toEqual(addedThread.id);
      expect(threadInDb[0].title).toEqual(newThread.title);
      expect(threadInDb[0].body).toEqual(newThread.body);
      expect(threadInDb[0].owner).toEqual(newThread.owner);
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should return thread correctly when found', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Thread Baru',
        body: 'isi thread ini sangat menarik',
        owner: 'user-123',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(thread.id).toEqual('thread-123');
      expect(thread.title).toEqual('Thread Baru');
      expect(thread.body).toEqual('isi thread ini sangat menarik');
      expect(thread.username).toEqual('dicoding');
    });
  });

  describe('verifyAvailableThread function', () => {
    it('should throw NotFoundError when thread does not exist', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyAvailableThread('thread-xxx'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw error when thread exists', async () => {
      // Arrange: Insert a thread
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123', title: 'Thread 1', body: 'Ini thread', owner: 'user-123',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyAvailableThread('thread-123'))
        .resolves.not.toThrowError(NotFoundError);
    });
  });
});
