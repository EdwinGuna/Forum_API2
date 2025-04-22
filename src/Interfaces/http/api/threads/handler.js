const GetThreadDetailUseCase = require('../../../../Applications/use_case/GetThreadDetailUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;
    this._getThreadDetailUseCase = container.getInstance(GetThreadDetailUseCase.name);
    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadDetailHandler = this.getThreadDetailHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { title, body } = request.payload;
    const { id: owner } = request.auth.credentials;

    const addThreadUseCase = this._container.getInstance('AddThreadUseCase');
    const addedThread = await addThreadUseCase.execute({ title, body, owner });

    const response = h.response({
      status: 'success',
      data: { addedThread },
    });
    response.code(201);
    return response;
  }

  async getThreadDetailHandler(request, h) {
    const { threadId } = request.params;

    const threadDetail = await this._getThreadDetailUseCase.execute({ threadId });

    const response = h.response({
      status: 'success',
      data: {
        thread: threadDetail,
      },
    });
    response.code(200);
    console.dir(threadDetail.comments, { depth: null });

    return response;
  }
}

module.exports = ThreadsHandler;
