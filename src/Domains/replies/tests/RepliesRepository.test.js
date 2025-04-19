const RepliesRepository = require('../RepliesRepository');

describe('RepliesRepository interface', () => {
  it('should throw error when invoking abstract behavior', async () => {
    // Arrange
    const repliesRepository = new RepliesRepository();

    // Action & Assert
    await expect(repliesRepository.addReply({})).rejects.toThrowError('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repliesRepository.deleteReplyById('reply-123')).rejects.toThrowError('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repliesRepository.verifyReplyOwner('reply-123', 'user-123')).rejects.toThrowError('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repliesRepository.getRepliesByCommentId('comment-123')).rejects.toThrowError('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
