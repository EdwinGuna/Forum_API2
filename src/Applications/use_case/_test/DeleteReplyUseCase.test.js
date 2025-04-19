const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const RepliesRepository = require('../../../Domains/replies/RepliesRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('DeleteReplyUseCase', () => {
  it('should orchestrate the delete reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      replyId: 'reply-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    // Mock dependencies
    const mockRepliesRepository = new RepliesRepository();
    const mockCommentsRepository = new CommentRepository();
    const mockThreadsRepository = new ThreadRepository();

    // Mock function implementations
    mockThreadsRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());
    mockCommentsRepository.verifyCommentExist = jest.fn(() => Promise.resolve());
    mockRepliesRepository.verifyReplyOwner = jest.fn(() => Promise.resolve());
    mockRepliesRepository.deleteReplyById = jest.fn(() => Promise.resolve());

    // Create use case instance
    const deleteReplyUseCase = new DeleteReplyUseCase({
      repliesRepository: mockRepliesRepository,
      commentRepository: mockCommentsRepository,
      threadRepository: mockThreadsRepository,
    });

    // Action
    await deleteReplyUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadsRepository.verifyAvailableThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentsRepository.verifyCommentExist).toBeCalledWith(useCasePayload.commentId);
    expect(mockRepliesRepository.verifyReplyOwner).toBeCalledWith(useCasePayload.replyId, useCasePayload.owner);
    expect(mockRepliesRepository.deleteReplyById).toBeCalledWith(useCasePayload.replyId);
  });

  it('should throw AuthorizationError when user is not the owner', async () => {
    // Arrange
    const useCasePayload = {
      replyId: 'reply-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    // Mock dependencies
    const mockThreadsRepository = new ThreadRepository();
    const mockCommentsRepository = new CommentRepository();
    const mockRepliesRepository = new RepliesRepository();
    mockThreadsRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());
    mockCommentsRepository.verifyCommentExist = jest.fn(() => Promise.resolve());
    mockRepliesRepository.verifyReplyOwner = jest.fn(() => Promise.reject(new AuthorizationError('Anda tidak berhak menghapus reply ini')));

    const deleteReplyUseCase = new DeleteReplyUseCase({
      repliesRepository: mockRepliesRepository,
      commentRepository: mockCommentsRepository,
      threadRepository: mockThreadsRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute(useCasePayload))
      .rejects.toThrowError(AuthorizationError);
  });

  it('should throw NotFoundError when reply does not exist', async () => {
    // Arrange
    const useCasePayload = {
      replyId: 'reply-xxx',
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    // Mock dependencies
    const mockThreadsRepository = new ThreadRepository();
    const mockCommentsRepository = new CommentRepository();
    const mockRepliesRepository = new RepliesRepository();
    mockThreadsRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());
    mockCommentsRepository.verifyCommentExist = jest.fn(() => Promise.resolve());
    mockRepliesRepository.verifyReplyOwner = jest.fn(() => Promise.reject(new NotFoundError('Balasan tidak ditemukan')));

    const deleteReplyUseCase = new DeleteReplyUseCase({
      repliesRepository: mockRepliesRepository,
      commentRepository: mockCommentsRepository,
      threadRepository: mockThreadsRepository,
    });

    // Action & Assert
    await expect(deleteReplyUseCase.execute(useCasePayload))
      .rejects.toThrowError(NotFoundError);
  });
});
