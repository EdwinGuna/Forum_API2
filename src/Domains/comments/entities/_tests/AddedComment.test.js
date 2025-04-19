const AddedComment = require('../AddedComment');

describe('AddedComment entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange: tanpa properti owner
    const payload = { id: 'comment id', content: 'ini adalah content' };

    // Act & Assert
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload content is not a string', () => {
    // Arrange: content dengan tipe data yang salah
    const payload = {
      id: 'comment id',
      content: 123,
      owner: 'comment-user',
    };

    // Act & Assert
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewComment correctly', () => {
    // Arrange
    const payload = { id: 'comment id', content: 'sebuah comment', owner: 'comment-user' };

    // Act
    const addedComment = new AddedComment(payload);

    // Assert
    expect(addedComment.id).toEqual(payload.id);
    expect(addedComment.content).toEqual(payload.content);
    expect(addedComment.owner).toEqual(payload.owner);
  });
});
