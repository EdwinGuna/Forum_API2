/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    thread_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    date: {
      type: 'TIMESTAMP WITH TIME ZONE',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    is_deleted: {
      type: 'BOOLEAN',
      notNull: true,
      default: false,
    },
  });

  // Menambahkan constraint foreign key untuk thread_id
  pgm.addConstraint(
    'comments',
    'fk_comments_thread_threads_id',
    'FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE ON UPDATE CASCADE',
  );

  // Menambahkan constraint foreign key untuk owner
  pgm.addConstraint('comments', 'fk_comments_owner_users', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('comments');
};
