const AddThreadUseCase = require('../AddThreadUseCase');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const UserRepository = require('../../../Domains/users/UserRepository');

describe('AddThreadUseCase', () => {
  it('should orchestrate the add thread action correctly', async () => {
    // 🔹 Arrange: Buat input yang akan digunakan
    const useCasePayload = {
      title: 'Judul Thread',
      body: 'Isi Thread',
      owner: 'user-123',
    };

    const fakeAddedThreadFromRepo = {
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    };

    const expectedAddedThread = new AddedThread(fakeAddedThreadFromRepo);

    // 🔹 Mock dependencies
    const mockThreadsRepository = new ThreadRepository();
    const mockUsersRepository = new UserRepository();

    // 🔹 Pastikan fungsi `addThread` pada repository mengembalikan `AddedThread`
    mockUsersRepository.verifyUserExist = jest.fn(() => Promise.resolve());
    mockThreadsRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(fakeAddedThreadFromRepo));

    // 🔹 Buat instance dari use case
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadsRepository,
      userRepository: mockUsersRepository,
    });

    // 🔹 Action: Jalankan fungsi `execute`
    const addedThread = await addThreadUseCase.execute(useCasePayload);

    // 🔹 Assert: Pastikan hasil sesuai ekspektasi
    expect(addedThread).toStrictEqual(expectedAddedThread);
    expect(mockThreadsRepository.addThread).toBeCalledWith(new NewThread(useCasePayload));
    expect(mockUsersRepository.verifyUserExist).toBeCalledWith(useCasePayload.owner);

    expect(addedThread.id).toEqual(expectedAddedThread.id);
    expect(addedThread.title).toEqual(expectedAddedThread.title);
    expect(addedThread.owner).toEqual(expectedAddedThread.owner);
  });
});
