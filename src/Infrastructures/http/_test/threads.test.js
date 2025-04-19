const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const container = require('../../container');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsHandler = require('../../../Interfaces/http/api/threads/handler');
const GetThreadDetailUseCase = require('../../../Applications/use_case/GetThreadDetailUseCase');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');

describe('/threads endpoint', () => {
  let accessToken, userId, username;

  beforeAll(async () => {
    // Clean up users table and create user via ServerTestHelper
    await UsersTableTestHelper.cleanTable();
   
    const user = await ServerTestHelper.getAccessToken({
      id: 'user-123',
      username: 'dicoding_thread',
    });
    
    accessToken = user.accessToken;
    userId = user.userId;
    username = user.username;
  });

  beforeEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persist thread', async () => {
      const requestPayload = {
        title: 'Thread Baru',
        body: 'Isi thread ini sangat menarik',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 400 when request payload does not contain needed property', async () => {
      const requestPayload = { title: 'Thread Tanpa Body' };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should throw an error when required properties are missing', async () => {
      // Data yang tidak lengkap
      const incompleteThreadData = { title: 'Thread Tanpa ID' };
      await expect(ThreadsTableTestHelper.addThread(incompleteThreadData))
        .rejects.toThrowError(/Missing properties:/);
    });

    it('should response 401 when request does not contain authentication token', async () => {
      const requestPayload = {
        title: 'Thread Baru',
        body: 'Isi thread ini sangat menarik',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 401 when request contains invalid authentication token', async () => {
      const requestPayload = {
        title: 'Thread Baru',
        body: 'Isi thread ini sangat menarik',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: 'Bearer invalid_token' },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 400 when request contains not meet data type specification', async () => {
      const requestPayload = {
        title: 12345,
        body: 'Isi thread ini sangat menarik',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
    });

    it('should respond with 500 when an internal server error occurs', async () => {
      const mockHandler = jest.spyOn(ThreadsHandler.prototype, 'postThreadHandler')
        .mockImplementationOnce(() => {
          throw new Error('Internal Server Error');
        });
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'Thread Baru', body: 'Isi thread' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toEqual(500);
      expect(response.result.message).toEqual('Terjadi kesalahan pada server kami');
      mockHandler.mockRestore();
    });
  });

  describe('GET /threads/{threadId}', () => {
    it('should return thread details correctly', async () => {
      // Buat thread lewat helper (owner: userId)
      await UsersTableTestHelper.addUser({
        id: userId,
        username: username, // sesuai yang dipakai saat login
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-789',
        title: 'Thread Detail Test',
        body: 'Thread Body for Testing',
        owner: userId,
      });

      const server = await createServer(container);

      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-789',
      });

      expect(response.statusCode).toEqual(200);
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toEqual('thread-789');
      expect(responseJson.data.thread.title).toEqual('Thread Detail Test');
    });

    it('should return 404 when thread is not found', async () => {
      const server = await createServer(container);
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-xxx',
      });

      expect(response.statusCode).toEqual(404);
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should respond with 500 when an internal server error occurs', async () => {
      const server = await createServer(container);
      const mockUseCase = jest.spyOn(GetThreadDetailUseCase.prototype, 'execute')
        .mockImplementationOnce(() => {
          throw new Error('Internal Server Error');
        });

      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-123',
      });

      expect(response.statusCode).toEqual(500);
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Terjadi kesalahan pada server kami');
      mockUseCase.mockRestore();
    });
  });

  describe('ThreadsTableTestHelper', () => {
    it('should find a thread by id', async () => {
      const threadData = {
        id: 'thread-123',
        title: 'Thread Test',
        body: 'Thread Body for Testing',
        owner: userId,
      };

      await UsersTableTestHelper.addUser({
        id: userId,
        username: username, // sesuai yang dipakai saat login
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });

      await ThreadsTableTestHelper.addThread(threadData);

      const foundThread = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(foundThread).toHaveLength(1);
      expect(foundThread[0].id).toEqual(threadData.id);
      expect(foundThread[0].title).toEqual(threadData.title);
      expect(foundThread[0].body).toEqual(threadData.body);
      expect(foundThread[0].owner).toEqual(threadData.owner);
    });

    it('should return an empty array when thread is not found', async () => {
      const foundThread = await ThreadsTableTestHelper.findThreadById('nonexistent-thread');
      expect(foundThread).toEqual([]);
    });
  });
});

