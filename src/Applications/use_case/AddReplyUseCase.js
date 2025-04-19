const AddedReply = require('../../Domains/replies/entities/AddedReply');
const NewReply = require('../../Domains/replies/entities/NewReply');

class AddReplyUseCase {
  constructor({
    replyRepository, commentRepository, threadRepository, userRepository,
  }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._userRepository = userRepository;
  }

  async execute(useCasePayload) {
    // ✅ VALIDASI terlebih dahulu sebelum lanjut ke DB
    const newReply = new NewReply(useCasePayload);

    await this._userRepository.verifyUserExist(newReply.owner);

    // Pastikan thread tersedia terlebih dahulu
    await this._threadRepository.verifyAvailableThread(newReply.threadId);

    // Pastikan comment tersedia terlebih dahulu
    await this._commentRepository.verifyCommentExist(newReply.commentId);

    // Tambahkan balasan ke comment melalui repository
    const addedReply = await this._replyRepository.addReply(newReply);
    // Kembalikan entitas AddedReply yang tervalidasi
    return new AddedReply(addedReply);
  }
}

module.exports = AddReplyUseCase;
