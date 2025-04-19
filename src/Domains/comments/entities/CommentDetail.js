class CommentDetail {
  constructor(payload) {
    const {
      id, username, date, content, isDeleted, replies = [],
    } = payload;

    // Simpan isDeleted hanya untuk pengujian (tidak tampil di JSON)
    Object.defineProperty(this, 'isDeleted', {
      value: isDeleted,
      enumerable: false, // Tidak akan ikut ke JSON.stringify
      writable: true,
    });

    if (
      id === undefined
      || content === undefined
      || date === undefined
      || username === undefined
      || isDeleted === undefined
      || replies === undefined
    ) {
      throw new Error('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
        || typeof content !== 'string'
        || !(typeof date === 'string' || date instanceof Date)
        || typeof username !== 'string'
        || typeof isDeleted !== 'boolean'
        || !Array.isArray(replies)
    ) {
      throw new Error('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    this.id = id;
    this.username = username;
    this.date = new Date(date).toISOString();
    this.content = isDeleted ? '**komentar telah dihapus**' : content;
    this.isDeleted = isDeleted;
    this.replies = replies;
  }
}

module.exports = CommentDetail;
