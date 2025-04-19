exports.up = pgm => {
    pgm.createTable('likes', {
        id: {
           type: 'VARCHAR(50)',
           primaryKey: true, 
        },
        comment_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        owner: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
    });

    pgm.addConstraint(
        'likes',
        'fk_likes.comment_id_comments.id',
        'FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE'
    );

    pgm.addConstraint(
        'likes',
        'fk_likes.owner_users.id',
        'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE'
    );
    
    pgm.addConstraint(
        'likes',
        'unique_owner_like_per_comment',
        'UNIQUE(comment_id, owner)'
    );
};

exports.down = pgm => {
    pgm.dropTable('likes');
};
