const CommentDetail = require('../CommentDetail');

describe('CommentDetail test', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = { id: 'comment id', content: 'ini adalah content' };

    // Act & Assert
    expect(() => new CommentDetail(payload)).toThrowError('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload content is not a string', () => {
    // Arrange: content dengan tipe data yang salah
    const payload = {
      id: 'comment id', username: 'dicoding', date: '2024-01-01T00:00:00.000Z', content: 123, isDeleted: false, replies: [],
    };

    // Act & Assert
    expect(() => new CommentDetail(payload)).toThrowError('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailComment object correctly when not deleted', () => {
    // Arrange: properti lengkap
    const payload = {
      id: 'comment id', username: 'dicoding', date: '2024-01-01T00:00:00.000Z', content: 'ini adalah content', isDeleted: false, replies: [],
    };

    // Act & Assert
    const detailComment = new CommentDetail(payload);
    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.username).toEqual(payload.username);
    expect(detailComment.date).toEqual(payload.date);
    expect(detailComment.content).toEqual(payload.content);
    expect(detailComment.isDeleted).toEqual(payload.isDeleted);
    expect(detailComment.replies).toEqual([]);
  });

  it('should create CommentDetail correctly when date is a Date instance', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'Sebuah komentar',
      date: new Date('2025-04-02T12:00:00.000Z'),
      username: 'dicoding',
      isDeleted: false,
      replies: [],
    };

    // Act
    const comment = new CommentDetail(payload);

    // Assert
    expect(comment.date).toEqual('2025-04-02T12:00:00.000Z');
  });

  it('should mask content when comment is deleted', () => {
    const payload = {
      id: 'comment id',
      username: 'dicoding',
      date: '2024-01-01T00:00:00.000Z',
      content: 'konten rahasia',
      isDeleted: true,
      replies: [],
    };

    const detailComment = new CommentDetail(payload);
    expect(detailComment.content).toEqual('**komentar telah dihapus**');
  });
});
