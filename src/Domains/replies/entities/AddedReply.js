class AddedReply {
  constructor(payload) {
    const {
      id, content, owner, commentId,
    } = payload;
    if (!id || !content || !owner) {
      throw new Error('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof content !== 'string' || typeof owner !== 'string') {
      throw new Error('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    this.id = id;
    this.content = content;
    this.owner = owner;
    this.commentId = commentId;
  }
}

module.exports = AddedReply;
