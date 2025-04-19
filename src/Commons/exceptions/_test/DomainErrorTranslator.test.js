const DomainErrorTranslator = require('../DomainErrorTranslator');
const InvariantError = require('../InvariantError');

describe('DomainErrorTranslator', () => {
  const mappings = [
    ['REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY', 'tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'],
    ['REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION', 'tidak dapat membuat user baru karena tipe data tidak sesuai'],
    ['REGISTER_USER.USERNAME_LIMIT_CHAR', 'tidak dapat membuat user baru karena karakter username melebihi batas limit'],
    ['REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER', 'tidak dapat membuat user baru karena username mengandung karakter terlarang'],
    ['USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY', 'harus mengirimkan username dan password'],
    ['USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION', 'username dan password harus string'],
    ['REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN', 'harus mengirimkan token refresh'],
    ['REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION', 'refresh token harus string'],
    ['DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN', 'harus mengirimkan token refresh'],
    ['DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION', 'refresh token harus string'],
    ['NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY', 'tidak dapat membuat thread karena properti yang dibutuhkan tidak ada'],
    ['NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION', 'tidak dapat membuat thread karena tipe data tidak sesuai'],
    ['NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY', 'tidak dapat menambahkan komentar karena properti yang dibutuhkan tidak ada'],
    ['NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION', 'tidak dapat menambahkan komentar karena tipe data tidak sesuai'],
    ['NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY', 'tidak dapat menambahkan balasan karena properti yang dibutuhkan tidak ada'],
    ['NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION', 'tidak dapat menambahkan balasan karena tipe data tidak sesuai'],
    
  ];

  it('should translate all known errors correctly', () => {
    mappings.forEach(([input, expectedMessage]) => {
      const result = DomainErrorTranslator.translate(new Error(input));
      expect(result).toBeInstanceOf(InvariantError);
      expect(result.message).toEqual(expectedMessage);
    });
  });

  it('should return original error when error message is not needed to translate', () => {
    const error = new Error('some_error_message');
    const translatedError = DomainErrorTranslator.translate(error);
    expect(translatedError).toStrictEqual(error);
  });
});
