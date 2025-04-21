const ToggleLikeUseCase = require('../ToggleLikeUseCase');

describe('ToggleLikeUseCase', () => {
  it('should like comment when not previously liked', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const mockUserRepository = {
      verifyUserExist: jest.fn().mockResolvedValue(),
    };
    

    const mockLikeRepository = {
      isCommentLiked: jest.fn().mockResolvedValue(false),
      likeComment: jest.fn().mockResolvedValue(undefined),
      unlikeComment: jest.fn(), // tidak dipanggil
    };

    const mockCommentRepository = {
      verifyCommentExist: jest.fn().mockResolvedValue(),
      verifyCommentBelongsToThread: jest.fn().mockResolvedValue(),
    };

    const toggleLikeUseCase = new ToggleLikeUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository
    });

    // Action
    await toggleLikeUseCase.execute(useCasePayload);

    // Assert
    expect(mockUserRepository.verifyUserExist).toBeCalledWith('user-123');
    expect(mockCommentRepository.verifyCommentExist).toBeCalledWith('comment-123');
    expect(mockCommentRepository.verifyCommentBelongsToThread).toBeCalledWith('comment-123', 'thread-123');
    expect(mockLikeRepository.isCommentLiked).toBeCalledWith('comment-123', 'user-123');
    expect(mockLikeRepository.isCommentLiked).toBeCalledTimes(1);
    expect(mockLikeRepository.likeComment).toBeCalledWith('comment-123', 'user-123');
    expect(mockLikeRepository.unlikeComment).not.toBeCalled();
  });

  it('should unlike comment when already liked', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const mockUserRepository = {
      verifyUserExist: jest.fn().mockResolvedValue(),
    };

    const mockLikeRepository = {
      isCommentLiked: jest.fn().mockResolvedValue(true),
      likeComment: jest.fn(), // tidak dipanggil
      unlikeComment: jest.fn().mockResolvedValue(undefined),
    };

    const mockCommentRepository = {
      verifyCommentExist: jest.fn().mockResolvedValue(),
      verifyCommentBelongsToThread: jest.fn().mockResolvedValue(),
    };

    const toggleLikeUseCase = new ToggleLikeUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository
    });

    // Action
    await toggleLikeUseCase.execute(useCasePayload);

    // Assert
    expect(mockUserRepository.verifyUserExist).toBeCalledWith('user-123');
    expect(mockCommentRepository.verifyCommentExist).toBeCalledWith('comment-123');
    expect(mockCommentRepository.verifyCommentBelongsToThread).toBeCalledWith('comment-123', 'thread-123');
    expect(mockLikeRepository.isCommentLiked).toBeCalledWith('comment-123', 'user-123');
    expect(mockLikeRepository.isCommentLiked).toBeCalledTimes(1);
    expect(mockLikeRepository.unlikeComment).toBeCalledWith('comment-123', 'user-123');
    expect(mockLikeRepository.likeComment).not.toBeCalled();
  });
});
