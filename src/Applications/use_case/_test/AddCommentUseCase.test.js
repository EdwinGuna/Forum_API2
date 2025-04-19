const AddCommentUseCase = require('../AddCommentUseCase');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NewComment = require('../../../Domains/comments/entities/NewComment');

describe('AddCommentUseCase', () => {
  it('should orchestrate the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      content: 'sebuah comment',
      owner: 'user-123',
    };

    const fakeAddedCommentFromRepo = {
      id: 'comment-abc123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    };

    const expectedAddedComment = new AddedComment(fakeAddedCommentFromRepo);

    const mockUsersRepository = {
      verifyUserExist: jest.fn().mockResolvedValue(),
    };

    // Membuat stub/fake untuk repository yang diperlukan
    const mockThreadsRepository = {
      verifyAvailableThread: jest.fn().mockResolvedValue(), // Pastikan thread ada
    };

    const mockCommentsRepository = {
      addComment: jest.fn().mockResolvedValue(fakeAddedCommentFromRepo),
    };

    // Membuat instance use case dengan dependency yang sudah di-mock
    const addCommentUseCase = new AddCommentUseCase({
      userRepository: mockUsersRepository,
      threadRepository: mockThreadsRepository,
      commentRepository: mockCommentsRepository,
    });

    // Act: jalankan use case
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    // Assert: verifikasi bahwa fungsi pada repository terpanggil dengan parameter yang benar
    expect(mockUsersRepository.verifyUserExist).toBeCalledWith(useCasePayload.owner);
    expect(mockThreadsRepository.verifyAvailableThread).toBeCalledWith(useCasePayload.threadId);
    // expect(mockCommentsRepository.addComment).toBeCalledWith(useCasePayload);
    expect(mockCommentsRepository.addComment).toBeCalledWith(expect.any(NewComment));

    // Verifikasi bahwa hasilnya adalah instance AddedComment dengan data yang sesuai
    expect(addedComment).toBeInstanceOf(AddedComment);
    expect(addedComment.id).toEqual(expectedAddedComment.id);
    expect(addedComment.content).toEqual(expectedAddedComment.content);
    expect(addedComment.owner).toEqual(expectedAddedComment.owner);
  });
});
