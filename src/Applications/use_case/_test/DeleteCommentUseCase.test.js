const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrate the delete comment action correctly', async () => {
    // Arrange: definisikan payload untuk menghapus komentar
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    // Buat stub/fake untuk repository
    const mockThreadRepository = {
      verifyAvailableThread: jest.fn().mockResolvedValue(), // Asumsi thread tersedia
    };

    const mockCommentRepository = {
      verifyCommentOwner: jest.fn().mockResolvedValue(), // Asumsi verifikasi owner berhasil
      deleteComment: jest.fn().mockResolvedValue(), // Asumsi delete berhasil
    };

    // Buat instance use case dengan dependency yang telah di-mock
    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Act: jalankan use case
    await deleteCommentUseCase.execute(useCasePayload);

    // Assert: pastikan setiap method pada repository terpanggil dengan parameter yang tepat
    expect(mockThreadRepository.verifyAvailableThread)
      .toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentOwner)
      .toBeCalledWith(useCasePayload.commentId, useCasePayload.owner);
    expect(mockCommentRepository.deleteComment)
      .toBeCalledWith(useCasePayload.commentId);
  });
});
