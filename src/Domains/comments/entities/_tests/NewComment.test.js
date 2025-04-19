const NewComment = require('../NewComment');

describe('NewComment entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange: payload kosong, tanpa properti content
    const payload = { content: 'komentar aja' };

    // Act & Assert
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload content is not a string', () => {
    // Arrange: content dengan tipe data yang salah
    const payload = {
      threadId: true,
      content: 123,
      owner: [],
    };

    // Act & Assert
    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewComment correctly', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      content: 'sebuah comment',
      owner: 'user-123',
    };

    // Act
    const newComment = new NewComment(payload);

    // Assert
    expect(newComment.threadId).toEqual(payload.threadId);
    expect(newComment.content).toEqual(payload.content);
    expect(newComment.owner).toEqual(payload.owner);
  });

  it('should assign date from payload when provided', () => {
    const payload = {
      content: 'komentar uji',
      owner: 'user-123',
      threadId: 'thread-123',
      date: '2025-04-04T10:00:00.000Z',
    };

    const newComment = new NewComment(payload);

    expect(newComment.date).toBe(payload.date);
  });

  it('should assign current ISO date when date is not provided', () => {
    const payload = {
      content: 'komentar uji',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    const before = new Date().toISOString(); // tangkap waktu sebelum
    const newComment = new NewComment(payload);
    const after = new Date().toISOString(); // tangkap waktu sesudah

    expect(newComment.date >= before && newComment.date <= after).toBe(true);
  });

  it('should assign new date when date is falsy (empty string)', () => {
    const payload = {
      content: 'komentar kosong',
      owner: 'user-123',
      threadId: 'thread-123',
      date: '', // falsy value
    };

    const before = new Date().toISOString();
    const newComment = new NewComment(payload);
    const after = new Date().toISOString();

    expect(newComment.date >= before && newComment.date <= after).toBe(true);
  });

  it('should default isDeleted to false when not provided', () => {
    const payload = {
      content: 'komentar',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    const newComment = new NewComment(payload);
    expect(newComment.isDeleted).toBe(false);
  });

  it('should default isDeleted to false when given null', () => {
    const payload = {
      content: 'komentar null',
      owner: 'user-123',
      threadId: 'thread-123',
      isDeleted: null,
    };

    const newComment = new NewComment(payload);

    expect(newComment.isDeleted).toBe(false);
  });
});
