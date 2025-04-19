class DeleteReplyUseCase {
  constructor({ repliesRepository, commentRepository, threadRepository }) {
    this._repliesRepository = repliesRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute({
    threadId, commentId, replyId, owner,
  }) {
    // Pastikan thread ada
    await this._threadRepository.verifyAvailableThread(threadId);

    // Pastikan komentar ada dalam thread
    await this._commentRepository.verifyCommentExist(commentId);

    // Pastikan reply ada dan milik user yang menghapus
    await this._repliesRepository.verifyReplyOwner(replyId, owner);

    // Lakukan soft delete reply
    await this._repliesRepository.deleteReplyById(replyId);
  }
}

module.exports = DeleteReplyUseCase;
