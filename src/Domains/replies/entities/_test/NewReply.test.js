const NewReply = require('../NewReply');

describe('NewReply entities', () => {
  it('should throw error when payload does not contain required property', () => {
    // Arrange
    const payload = {}; // Kosong

    // Action & Assert
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 12345, // Harus string
      threadId: 'thread-123',
      owner: true, // Harus string
      commentId: {}, // Harus string
    };

    // Action & Assert
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewReply object correctly', () => {
    // Arrange
    const payload = {
      content: 'Ini balasan baru',
      threadId: 'thread-123',
      owner: 'user-123',
      commentId: 'comment-456',
    };

    // Action
    const newReply = new NewReply(payload);

    // Assert
    expect(newReply.content).toEqual(payload.content);
    expect(newReply.threadId).toEqual(payload.threadId);
    expect(newReply.owner).toEqual(payload.owner);
    expect(newReply.commentId).toEqual(payload.commentId);
  });

  it('should assign default date and isDeleted if not provided', () => {
    const payload = {
      content: 'balasan default',
      threadId: 'thread-123',
      owner: 'user-123',
      commentId: 'comment-456',
    };

    const reply = new NewReply(payload);

    expect(reply.date).toBeDefined();
    expect(typeof reply.date).toBe('string');
    expect(reply.isDeleted).toBe(false);
  });

  it('should assign provided date and isDeleted when available', () => {
    const payload = {
      content: 'balasan eksplisit',
      threadId: 'thread-123',
      owner: 'user-123',
      commentId: 'comment-456',
      date: '2025-04-04T12:00:00.000Z',
      isDeleted: true,
    };

    const reply = new NewReply(payload);

    expect(reply.date).toEqual(payload.date);
    expect(reply.isDeleted).toBe(true);
  });
});
