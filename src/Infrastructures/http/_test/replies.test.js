const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const container = require('../../container');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const bcrypt = require('bcrypt');

describe('/replies endpoint', () => {
  let accessToken, userId, username;
  let threadId;
  let commentId;

  beforeAll(async () => {
    const server = await createServer(container);
    await UsersTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
/*
    // Register User
    const userPayload = {
      username: 'testuser',
      password: 'secret',
      fullname: 'Test User',
    };

    const userResponse = await server.inject({
      method: 'POST',
      url: '/users',
      payload: userPayload,
    });

    expect(userResponse.statusCode).toBe(201); // Pastikan user dibuat

    // Login User
    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'testuser',
        password: 'secret',
      },
    });*/
    const user1 = await ServerTestHelper.getAccessToken({
      id: 'user-123',
      username: 'testuser',        
    })

    //const { data } = JSON.parse(loginResponse.payload);
    accessToken = user1.accessToken;
    userId = user1.userId;
    username = user1.username;

    // Add Thread
    const threadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: { title: 'Thread Test', body: 'Ini thread test' },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    threadId = JSON.parse(threadResponse.payload).data.addedThread.id;

    // Add Comment
    const commentResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: { content: 'Komentar test' },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    commentId = JSON.parse(commentResponse.payload).data.addedComment.id;
  });

  afterEach(async () => {
    //ThreadsTableTestHelper.cleanTable();
  })

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should respond 201 and persist reply when request is valid', async () => {
      const server = await createServer(container);
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: { content: 'Ini adalah balasan' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(201);
      expect(responseJson.status).toBe('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.content).toBe('Ini adalah balasan');
    });

    it('should insert a reply into the database', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-xyz',
        username: 'xyzuser',
        password: 'hashedpassword',
        fullname: 'XYZ User',
      });

      // ✅ Pastikan thread ada sebelum insert reply
      await ThreadsTableTestHelper.addThread({
        id: 'thread-test',
        title: 'Judul Thread',
        body: 'Isi thread',
        owner: 'user-xyz',
      });

      // ✅ Pastikan komentar ada sebelum insert reply
      await CommentsTableTestHelper.addComment({
        id: 'comment-test',
        threadId: 'thread-test',
        content: 'Ini komentar untuk diuji',
        owner: 'user-xyz',
      });

      // Arrange
      await RepliesTableTestHelper.addReply({
        id: 'reply-xyz',
        commentId: 'comment-test',
        content: 'Balasan test',
        owner: 'user-xyz',
      });

      // Act
      const result = await RepliesTableTestHelper.findReplyById('reply-xyz');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toEqual('reply-xyz');
      expect(result[0].comment_id).toEqual('comment-test');
      expect(result[0].owner).toEqual('user-xyz');
    });

    it('should insert a reply with all default values', async () => {
      // Pastikan user-123, comment-123 sudah tersedia di database!
      //await ThreadsTableTestHelper.cleanTable();
      const hashedPassword = await bcrypt.hash('secret', 10);

      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'default_user',
        password: hashedPassword,
        fullname: 'Default User',
      });
    
      await ThreadsTableTestHelper.addThread({
        id: 'thread-234',
        title: 'Thread Default',
        body: 'Thread ini untuk default test',
        owner: 'user-123',
      });
    
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-234',
        content: 'Komentar default',
        owner: 'user-123',
      });
    
      // 🔥 Ini akan men-trigger default `commentId` & `owner`
      await RepliesTableTestHelper.addReply();
    
      const result = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(result).toHaveLength(1);
      expect(result[0].comment_id).toBe('comment-123');
      expect(result[0].owner).toBe('user-123');
    });
    
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should respond 200 when deleting a reply', async () => {
      const server = await createServer(container);

      // Add Reply
      const addReplyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: { content: 'Balasan yang akan dihapus' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Pastikan response sukses sebelum mengambil ID
      expect(addReplyResponse.statusCode).toBe(201);

      const parsedResponse = JSON.parse(addReplyResponse.payload);
      const replyId1 = parsedResponse.data.addedReply.id; // Simpan replyId baru

      // 🔹 Verifikasi apakah reply benar-benar ada di database
      const replyInDb = await RepliesTableTestHelper.findReplyById(replyId1);
      expect(replyInDb).toHaveLength(1);

      // Delete Reply
      const deleteResponse = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId1}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      expect(deleteResponse.statusCode).toBe(200);
    });

    it('should respond 404 when deleting a reply that does not exist', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/reply-xxx`, // ID tidak valid
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(404);
      expect(response.result.status).toBe('fail');
      expect(response.result.message).toMatch('Balasan tidak ditemukan');
    });
  });
});
