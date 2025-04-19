const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const RepliesRepository = require('../../../Domains/replies/RepliesRepository');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../../Domains/replies/entities/ReplyDetail');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate the get thread detail action correctly', async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new RepliesRepository();
    
    const threadId = 'thread-123';
    const commentId = 'comment-456';
    const replyId = 'reply-789';

    const expectedComments = [
      {
        id: commentId,
        content: 'sebuah comment',
        date: '2021-08-08T07:59:18.982Z',
        username: 'dicoding',
        isDeleted: true,
        replies: [], // Akan diperbarui
      },
    ];

    const expectedReplies = [
      {
        id: replyId,
        comment_id: commentId,
        content: 'sebuah balasan',
        date: '2021-08-08T08:07:01.522Z',
        username: 'johndoe',
        isDeleted: false,
      },
      {
        id: 'reply-456',
        comment_id: commentId,
        content: '**balasan telah dihapus**',
        date: '2021-08-08T08:07:02.522Z',
        username: 'janedoe',
        isDeleted: true,
      },
    ];

    // Mocking repository functions
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: threadId,
        title: 'Thread title',
        body: 'Thread body',
        date: '2021-08-08T07:59:16.198Z',
        username: 'dicoding',
      }));

    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComments));

    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation((replycommentId) => Promise.resolve(expectedReplies.filter((r) => r.comment_id === replycommentId)));
    
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository, // Pastikan ini digunakan
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute({ threadId });

    // Assert
    expect(threadDetail).toStrictEqual(new ThreadDetail({
      id: threadId,
      title: 'Thread title',
      body: 'Thread body',
      date: '2021-08-08T07:59:16.198Z',
      username: 'dicoding',
      comments: [
        new CommentDetail({
          id: commentId,
          content: 'sebuah comment',
          date: '2021-08-08T07:59:18.982Z',
          username: 'dicoding',
          isDeleted: true,
          replies: [
            new ReplyDetail({
              id: replyId,
              content: 'sebuah balasan',
              date: '2021-08-08T08:07:01.522Z',
              username: 'johndoe',
              isDeleted: false,
            }),
            new ReplyDetail({
              id: 'reply-456',
              content: '**balasan telah dihapus**',
              date: '2021-08-08T08:07:02.522Z',
              username: 'janedoe',
              isDeleted: true,
            }),
          ],
        }),
      ],
    }));

    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(commentId); // Pastikan ini dipanggil
  });

  it('should handle comment without replies', async () => {
    const threadId = 'thread-321';
    const commentId = 'comment-000';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new RepliesRepository();
    
    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue({
      id: threadId,
      title: 'Judul',
      body: 'Isi',
      date: '2025-01-01T00:00:00.000Z',
      username: 'user',
    });

    mockCommentRepository.getCommentsByThreadId = jest.fn().mockResolvedValue([
      {
        id: commentId,
        content: 'Komentar tanpa balasan',
        date: '2025-01-01T01:00:00.000Z',
        username: 'user',
        isDeleted: false,
      },
    ]);

    mockReplyRepository.getRepliesByCommentId = jest.fn().mockResolvedValue(undefined); // <- bikin coverage nambah

    const useCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      
    });

    const result = await useCase.execute({ threadId });
    expect(result).toBeInstanceOf(ThreadDetail);
    expect(result.comments[0].replies).toEqual([]);
  });
});
