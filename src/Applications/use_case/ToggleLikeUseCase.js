const NewLike = require('../../Domains/likes/entities/NewLike');

class ToggleLikeUseCase {
    constructor({ likeRepository, commentRepository, userRepository }) {
        this._likeRepository = likeRepository;
        this._commentRepository = commentRepository;
        this._userRepository = userRepository        
    }
    
    async execute({ commentId, threadId, owner }) {
        const newLike = new NewLike({ commentId, owner });

        await this._userRepository.verifyUserExist(newLike.owner);
        await this._commentRepository.verifyCommentBelongsToThread(newLike.commentId, threadId);

        // Pastikan thread tersedia terlebih dahulu
        await this._commentRepository.verifyCommentExist(newLike.commentId);

        const isLiked = await this._likeRepository.isCommentLiked(newLike.commentId, newLike.owner);

        if (isLiked) {
          await this._likeRepository.unlikeComment(newLike.commentId, newLike.owner);
          
        } else {
          await this._likeRepository.likeComment(newLike.commentId, newLike.owner);
          
        }
    }
}

module.exports = ToggleLikeUseCase;