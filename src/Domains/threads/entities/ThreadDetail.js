class ThreadDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, title, body, date, username, comments,
    } = payload;

    this.id = id;
    this.title = title;
    this.body = body;
    this.date = new Date(date).toISOString();
    this.username = username;
    this.comments = comments;
  }

  _verifyPayload(payload) {
    if (!('id' in payload)
        || !('title' in payload)
        || !('body' in payload)
        || !('date' in payload)
        || !('username' in payload)
        || !('comments' in payload)) {
      throw new Error('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    // Pastikan tipe data sudah benar
    if (
      typeof payload.id !== 'string'
      || typeof payload.title !== 'string'
      || typeof payload.body !== 'string'
      || !(typeof payload.date === 'string' || payload.date instanceof Date)
      || typeof payload.username !== 'string'
      || !Array.isArray(payload.comments)
    ) {
      throw new Error('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ThreadDetail;
