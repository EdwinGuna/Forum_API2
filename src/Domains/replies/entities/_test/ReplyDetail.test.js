const ReplyDetail = require('../ReplyDetail');

describe('ReplyDetail entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = { id: 'reply-123' }; // Tidak lengkap

    expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    const payload = {
      id: 123,
      content: 'ini balasan',
      date: new Date(),
      username: 'userA',
      isDeleted: 'false', // Harus boolean
    };

    expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ReplyDetail object correctly when reply is not deleted', () => {
    const payload = {
      id: 'reply-123',
      content: 'Balasan aktif',
      date: '2025-03-07T07:45:00.000Z',
      username: 'user-123',
      isDeleted: false,
    };

    const replyDetail = new ReplyDetail(payload);

    expect(replyDetail.id).toEqual(payload.id);
    expect(replyDetail.content).toEqual(payload.content);
    expect(replyDetail.date).toEqual(payload.date);
    expect(replyDetail.username).toEqual(payload.username);
    expect(replyDetail.isDeleted).toEqual(payload.isDeleted);
  });

  it('should create ReplyDetail object correctly when date is a Date instance', () => {
    const payload = {
      id: 'reply-123',
      content: 'ini balasan',
      date: new Date('2025-04-02T12:30:00.000Z'),
      username: 'dicoding',
      isDeleted: false,
    };

    const reply = new ReplyDetail(payload);

    expect(reply.date).toBe('2025-04-02T12:30:00.000Z');
  });

  it('should create ReplyDetail object correctly when reply is deleted', () => {
    const payload = {
      id: 'reply-123',
      content: 'Balasan yang akan dihapus',
      date: '2025-03-07T07:45:00.000Z',
      username: 'user-123',
      isDeleted: true,
    };

    const replyDetail = new ReplyDetail(payload);

    expect(replyDetail.id).toEqual(payload.id);
    expect(replyDetail.content).toEqual('**balasan telah dihapus**'); // Sesuai syarat
    expect(replyDetail.date).toEqual(payload.date);
    expect(replyDetail.username).toEqual(payload.username);
    expect(replyDetail.isDeleted).toEqual(payload.isDeleted);
  });
});
