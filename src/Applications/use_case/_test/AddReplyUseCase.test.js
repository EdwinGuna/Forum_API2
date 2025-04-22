const AddReplyUseCase = require('../AddReplyUseCase');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const RepliesRepository = require('../../../Domains/replies/RepliesRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const UserRepository = require('../../../Domains/users/UserRepository');

describe('AddReplyUseCase', () => {
  it('should orchestrate the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      content: 'Ini adalah balasan',
      owner: 'user-123',
    };

    const fakeReplyFromRepo = {
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    };

    const expectedReply = new AddedReply(fakeReplyFromRepo);

    // Mock dependencies
    const mockRepliesRepository = new RepliesRepository();
    const mockCommentsRepository = new CommentRepository();
    const mockThreadsRepository = new ThreadRepository();
    const mockUsersRepository = new UserRepository();

    // Mock function implementations
    mockUsersRepository.verifyUserExist = jest.fn(() => Promise.resolve());
    mockThreadsRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());
    mockCommentsRepository.verifyCommentExist = jest.fn(() => Promise.resolve());
    mockRepliesRepository.addReply = jest.fn(() => Promise.resolve(fakeReplyFromRepo));

    // Create use case instance
    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockRepliesRepository,
      commentRepository: mockCommentsRepository,
      threadRepository: mockThreadsRepository,
      userRepository: mockUsersRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(addedReply).toStrictEqual(expectedReply);
    expect(mockUsersRepository.verifyUserExist).toBeCalledWith(useCasePayload.owner);
    expect(mockThreadsRepository.verifyAvailableThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentsRepository.verifyCommentExist).toBeCalledWith(useCasePayload.commentId);
    expect(mockRepliesRepository.addReply).toBeCalledWith(expect.objectContaining({
      content: useCasePayload.content,
      owner: useCasePayload.owner,
      commentId: useCasePayload.commentId,
      threadId: useCasePayload.threadId,
    }));

    expect(addedReply.id).toEqual(expectedReply.id);
    expect(addedReply.content).toEqual(expectedReply.content);
    expect(addedReply.owner).toEqual(expectedReply.owner);
  });
});
