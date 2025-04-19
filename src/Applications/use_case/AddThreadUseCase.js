const NewThread = require('../../Domains/threads/entities/NewThread');
const AddedThread = require('../../Domains/threads/entities/AddedThread');

class AddThreadUseCase {
  constructor({ threadRepository, userRepository }) {
    this._threadRepository = threadRepository;
    this._userRepository = userRepository;
  }

  async execute(useCasePayload) {
    const newThread = new NewThread(useCasePayload);

    await this._userRepository.verifyUserExist(useCasePayload.owner);

    const addedThread = await this._threadRepository.addThread(newThread);
    return new AddedThread(addedThread);
  }
}

module.exports = AddThreadUseCase;
