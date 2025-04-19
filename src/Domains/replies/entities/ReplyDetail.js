class ReplyDetail {
  constructor(payload) {
    const {
      id, content, date, username, isDeleted,
    } = payload;

    Object.defineProperty(this, 'isDeleted', {
      value: isDeleted,
      enumerable: false,
      writable: true,
    });

    // ✅ Validasi terlebih dahulu
    if (
      id === undefined || content === undefined || date === undefined
      || username === undefined || isDeleted === undefined
    ) {
      throw new Error('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' || typeof content !== 'string'
      || !(typeof date === 'string' || date instanceof Date)
      || typeof username !== 'string' || typeof isDeleted !== 'boolean'
    ) {
      throw new Error('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    // ✅ Baru set properti setelah lolos validasi
    this.id = id;
    this.content = isDeleted ? '**balasan telah dihapus**' : content;
    this.date = new Date(date).toISOString();
    this.username = username;
    this.isDeleted = isDeleted;
  }
}

module.exports = ReplyDetail;
