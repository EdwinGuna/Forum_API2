class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute({ threadId, commentId, owner }) {
    // Pastikan thread ada
    await this._threadRepository.verifyAvailableThread(threadId);

    // Verifikasi bahwa owner adalah pemilik komentar
    await this._commentRepository.verifyCommentOwner(commentId, owner);

    // Lakukan proses delete (soft delete)
    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;
