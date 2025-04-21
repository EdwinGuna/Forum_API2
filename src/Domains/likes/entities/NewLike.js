class NewLike {
    constructor(payload) {
      const { commentId, owner } = payload;
  
      if (!commentId || !owner) {
        throw new Error('NEW_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
      }
  
      if (typeof commentId !== 'string'
        || typeof owner !== 'string') {
        throw new Error('NEW_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
      }
  
      this.commentId = commentId;
      this.owner = owner;
    }
  }
  
  module.exports = NewLike;