/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('replies', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    date: {
      type: 'TIMESTAMP',
      default: pgm.func('current_timestamp'),
    },
    is_deleted: {
      type: 'BOOLEAN',
      default: false,
    },
  });

  pgm.addConstraint(
    'replies',
    'fk_replies_comment_comments_id',
    'FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE ON UPDATE CASCADE',
  );

  pgm.addConstraint('replies', 'fk_replies_owner_users_id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('replies');
};
