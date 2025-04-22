const NewLike = require('../NewLike');

describe('NewLike entities', () => {
  it('should throw error when payload does not contain required property', () => {
    // Arrange
    const payload = {}; // Kosong

    // Action & Assert
    expect(() => new NewLike(payload)).toThrowError('NEW_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      commentId: {}, // Harus string
      owner: true, // Harus string
    };

    // Action & Assert
    expect(() => new NewLike(payload)).toThrowError('NEW_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewLike object correctly', () => {
    // Arrange
    const payload = {
      commentId: 'comment-456',
      owner: 'user-123',
    };

    // Action
    const newLike = new NewLike(payload);

    // Assert
    expect(newLike.commentId).toEqual(payload.commentId);
    expect(newLike.owner).toEqual(payload.owner);
  });
});