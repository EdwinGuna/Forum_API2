const AddedComment = require('../../Domains/comments/entities/AddedComment');
const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository, userRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._userRepository = userRepository;
  }

  async execute(useCasePayload) {
    const newComment = new NewComment(useCasePayload);

    await this._userRepository.verifyUserExist(useCasePayload.owner);

    // Pastikan thread tersedia terlebih dahulu
    await this._threadRepository.verifyAvailableThread(useCasePayload.threadId);

    // Tambahkan komentar ke thread melalui repository
    const addedComment = await this._commentRepository.addComment(newComment);

    // Kembalikan entitas AddedComment yang tervalidasi
    return new AddedComment(addedComment);
  }
}

module.exports = AddCommentUseCase;
