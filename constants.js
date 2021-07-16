const NO_BOOK = 'no book exists';

module.exports = {
    CREATE_BOOK_MISSING: 'missing required field title',
    GET_BOOK_NO_BOOK: NO_BOOK,
    CREATE_COMMENT: {
        NO_BOOK,
        MISSING: 'missing required field comment'
    },
    DELETE_BOOK: {
        SUCCESS: 'delete successful',
        NO_BOOK
    },
    DELETE_ALL: 'complete delete successful'
}
