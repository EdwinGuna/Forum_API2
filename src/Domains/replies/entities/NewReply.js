class NewReply {
  constructor(payload) {
    const {
      content, threadId, owner, commentId, date, isDeleted,
    } = payload;

    if (!content || !threadId || !owner || !commentId) {
      throw new Error('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string'
      || typeof threadId !== 'string'
      || typeof owner !== 'string'
      || typeof commentId !== 'string') {
      throw new Error('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    this.content = content;
    this.threadId = threadId;
    this.owner = owner;
    this.commentId = commentId;
    this.date = date || new Date().toISOString();
    this.isDeleted = isDeleted ?? false;
  }
}

module.exports = NewReply;
