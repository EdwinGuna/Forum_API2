const CommentDetail = require('../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../Domains/replies/entities/ReplyDetail');
const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');
const { mapDBToReplyModel, mapDBToCommentModel, mapDBToThreadModel } = require('../../Infrastructures/utils');

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute({ threadId }) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    // ✅ Gunakan Promise.all untuk mempercepat proses pengambilan replies
    const repliesArray = await Promise.all(
      comments.map((comment) => this._replyRepository.getRepliesByCommentId(comment.id)),
    );

    const enrichedComments = comments.map((comment, index) => {
      const replies = (repliesArray[index] || []).map((reply) => {
        const mapped = mapDBToReplyModel(reply);
        console.log('🧪 Data yang masuk ke ReplyDetail:', mapped);
        return new ReplyDetail(mapped);
      });

      return new CommentDetail({
        ...mapDBToCommentModel(comment),
        replies,
      });
    });

    return new ThreadDetail({
      ...mapDBToThreadModel(thread),
      comments: enrichedComments,
    });
  }
}

module.exports = GetThreadDetailUseCase;
