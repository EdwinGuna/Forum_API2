class NewComment {
  constructor(payload) {
    // const { content, owner, threadId } = payload;
    const {
      content, owner, threadId, date = new Date().toISOString(), isDeleted = false,
    } = payload;

    if (!content || !owner || !threadId) {
      throw new Error('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string' || typeof owner !== 'string' || typeof threadId !== 'string') {
      throw new Error('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    this.content = content;
    this.owner = owner;
    this.threadId = threadId;
    this.date = date || new Date().toISOString();
    this.isDeleted = isDeleted ?? false;
  }
}

module.exports = NewComment;
