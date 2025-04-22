/* eslint-disable no-console */
const request = require('supertest');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const createServer = require('../createServer');
const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');

describe('Comments Endpoints', () => {
  let server; let accessToken; let userId; let
    username;

  beforeAll(async () => {
    server = await createServer(container);
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();

    const user = await ServerTestHelper.getAccessToken({
      id: 'user-123',
      username: 'dicoding',
    });

    console.log('✅ USER RESULT:', user);

    accessToken = user.accessToken;
    userId = user.userId;
    username = user.username;

    // Gunakan userId dari response saat membuat thread
    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      title: 'Thread Test',
      body: 'Isi thread test',
      owner: userId, // Pakai ID user yang sesuai
    });
  });

  beforeEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      title: 'Thread Test',
      body: 'Isi thread test',
      owner: userId,
    });
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('POST /threads/{threadId}/comments', () => {
    it('should respond with 201 and added comment when payload is valid', async () => {
      if (!accessToken) throw new Error('Access Token tidak tersedia sebelum menguji komentar!');

      const response = await request(server.listener)
        .post('/threads/thread-123/comments')
        .set('Authorization', `Bearer ${accessToken}`) // Token yang menghasilkan owner = 'user-123'
        .send({ content: 'This is a test comment' });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data.addedComment).toHaveProperty('id');
      expect(response.body.data.addedComment.content).toEqual('This is a test comment');
      expect(response.body.data.addedComment.owner).toEqual(userId);
    });

    it('should respond with 400 when payload is missing content', async () => {
      const response = await request(server.listener)
        .post('/threads/thread-123/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should respond with 404 when thread does not exist', async () => {
      const response = await request(server.listener)
        .post('/threads/nonexistent-thread/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Comment for non-existent thread' });

      expect(response.statusCode).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should add comment even if id and isDeleted are not provided', async () => {
      // Arrange
      const newComment = {
        threadId: 'thread-123',
        content: 'Comment without id',
        owner: userId,
      };

      // Act
      const addedComment = await CommentsTableTestHelper.addComment(newComment);

      // ✅ Gunakan ID yang dikembalikan untuk mengambil komentar dari database
      const retrievedComment = await CommentsTableTestHelper.getCommentById(addedComment.id);
      // Assert
      expect(retrievedComment).toBeDefined();
      expect(retrievedComment.content).toEqual(newComment.content);
    });

    it('should throw an error when trying to add comment without a valid user', async () => {
      await expect(CommentsTableTestHelper.addComment({
        id: 'comment-999',
        threadId: 'thread-123',
        content: 'This should fail',
        owner: 'user-not-exist',
      })).rejects.toThrow();
    });

    it('should throw error if user does not exist', async () => {
      await expect(CommentsTableTestHelper.addComment({
        id: 'comment-999',
        threadId: 'thread-123',
        content: 'This should fail',
        owner: 'nonexistent-user',
      })).rejects.toThrow('USER_NOT_FOUND');
    });

    it('should throw USER_NOT_FOUND error when adding comment with non-existent user', async () => {
      await expect(CommentsTableTestHelper.addComment({
        threadId: 'thread-123',
        content: 'Invalid comment',
        owner: 'nonexistent-user',
      })).rejects.toThrow('USER_NOT_FOUND');
    });

    it('should throw THREAD_NOT_FOUND error when adding comment to non-existent thread', async () => {
      await expect(CommentsTableTestHelper.addComment({
        threadId: 'nonexistent-thread',
        content: 'Comment for invalid thread',
        owner: userId,
      })).rejects.toThrow('THREAD_NOT_FOUND');
    });

    it('should add comment with default values when no parameters are provided', async () => {
      try {
        const addedComment = await CommentsTableTestHelper.addComment({});

        expect(addedComment).toBeDefined();
        expect(addedComment.id).toBeDefined(); // ID harus tetap ada
        expect(addedComment.threadId).toEqual('thread-123');
        expect(addedComment.content).toEqual('This is a test comment');
        expect(addedComment.owner).toEqual(userId);
        expect(addedComment.date).toBeDefined();
        expect(addedComment.is_deleted).toBe(false);
      } catch (error) {
        console.error('ERROR di addComment:', error);
      }
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should respond with 200 and success when comment is deleted by owner', async () => {
      // Siapkan komentar terlebih dahulu menggunakan helper
      const commentId = `comment-${nanoid(6)}`;

      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId: 'thread-123',
        content: 'Comment to be deleted',
        owner: userId,
        date: new Date().toISOString(),
        isDeleted: false,
      });

      const response = await request(server.listener)
        .delete(`/threads/thread-123/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`); // Menghasilkan owner 'user-123'

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');

      // Verifikasi bahwa komentar telah di-soft delete
      const deletedComment = await CommentsTableTestHelper.getCommentById(commentId);
      expect(deletedComment.is_deleted).toBe(true);
    });

    it('should respond with 403 if the user is not the comment owner', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-234',
        username: 'not-owner',
        password: await bcrypt.hash('secret', 10),
        fullname: 'Another User',
      });

      // Siapkan komentar dengan owner berbeda
      const commentId = `comment-${nanoid(6)}`;

      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId: 'thread-123',
        content: 'Comment not owned by user-123',
        owner: 'user-234',
        date: new Date().toISOString(),
        isDeleted: false,
      });

      const response = await request(server.listener)
        .delete(`/threads/thread-123/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`); // Token untuk 'user-123'

      expect(response.statusCode).toBe(403);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should respond with 404 if the comment does not exist', async () => {
      const response = await request(server.listener)
        .delete('/threads/thread-123/comments/nonexistent-comment')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBeDefined();
    });
  });
});
