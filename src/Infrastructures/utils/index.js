const mapDBToReplyModel = (reply) => ({
  id: reply.id,
  commentId: reply.commentId,
  content: reply.content,
  date: reply.date,
  username: reply.username,
  isDeleted: reply.isDeleted,
});

const mapDBToCommentModel = (comment) => ({
  id: comment.id,
  content: comment.content,
  date: comment.date,
  username: comment.username,
  isDeleted: comment.isDeleted,
});

const mapDBToThreadModel = (thread) => ({
  id: thread.id,
  title: thread.title,
  body: thread.body,
  date: thread.date,
  username: thread.username,
});

module.exports = {
  mapDBToReplyModel,
  mapDBToCommentModel,
  mapDBToThreadModel,
};
