/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const Book = require('../models/book');
const MSG = require('../constants');

chai.use(chaiHttp);

suite('Functional Tests', function () {

    /*
    * ----[EXAMPLE TEST]----
    * Each test should completely test the response of the API end-point including response status code!

    test('#example Test GET /api/books', function (done) {
        chai.request(server)
            .get('/api/books')
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body, 'response should be an array');
                assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
                assert.property(res.body[0], 'title', 'Books in array should contain title');
                assert.property(res.body[0], '_id', 'Books in array should contain _id');
                done();
            });
    });
    /*
    * ----[END of EXAMPLE TEST]----
    */

    suite('Routing tests', function () {


        suite('POST /api/books with title => create book object/expect book object', function () {

            test('Test POST /api/books with title', async function () {
                const title = 'A Brief Description of Fortitude';

                const response = await chai.request(server).post('/api/books').type('json').send({title});
                assert.equal(response.status, 200);
                assert.hasAllKeys(response.body, ['_id', 'title']);
                assert.isString(response.body._id);
                assert.equal(response.body.title, title);
            });

            test('Test POST /api/books with no title given', async function () {
                const response = await chai.request(server).post('/api/books').type('json').send({});
                assert.equal(response.status, 200);
                assert.equal(response.text, MSG.CREATE_BOOK_MISSING);
            });

        });


        suite('GET /api/books => array of books', function () {

            test('Test GET /api/books', async function () {
                const title = 'Liminuvourous';
                const newBook = new Book({title});
                await newBook.save();
                const bookCount = await Book.countDocuments();
                assert.isAtLeast(bookCount, 1);

                const response = await chai.request(server).get('/api/books');
                assert.equal(response.status, 200);
                assert.isArray(response.body);
                assert.equal(response.body.length, bookCount);

                await newBook.delete();
            });

        });


        suite('GET /api/books/[id] => book object with [id]', function () {

            test('Test GET /api/books/[id] with id not in db', async function () {
                const response = await chai.request(server).get('/api/books/1234');
                assert.equal(response.status, 200);
                assert.equal(response.text, MSG.GET_BOOK_NO_BOOK);
            });

            test('Test GET /api/books/[id] with valid id in db', async function () {
                const newBook = Book({
                    title: 'Louie, Louie!', comments: [
                        'Oh, baby, said we gotta go.',
                        'Yeah, yeah, yeah, yeah, yeah, yeah'
                    ]
                })
                await newBook.save();

                const response = await chai.request(server).get('/api/books/' + newBook.id);
                assert.equal(response.status, 200);

                assert.equal(response.body.title, newBook.title);
                assert.equal(response.body._id, newBook._id);

                await newBook.delete();
            });

        });


        suite('POST /api/books/[id] => add comment/expect book object with id', function () {
            const makeBook = async () => {
                const newBook = Book({
                    title: 'Louie, Louie!', comments: [
                        'Oh, baby, said we gotta go.',
                        'Yeah, yeah, yeah, yeah, yeah, yeah'
                    ]
                })
                await newBook.save();
                return newBook;
            }

            test('Test POST /api/books/[id] with comment', async function () {
                const book = await makeBook();
                const comment = 'Me gotta go';
                const response = await chai.request(server).post('/api/books/' + book._id).type('json').send({comment});
                assert.equal(response.status, 200);
                assert.hasAllKeys(response.body, ['_id', 'title', 'comments']);
                assert.equal(response.body._id, book._id);
                assert.equal(response.body.title, book.title);

                const updatedBook = await Book.findById(book._id);
                assert.isNotNull(updatedBook);
                assert.deepEqual(response.body.comments, updatedBook.comments);

                await book.delete();
            });

            test('Test POST /api/books/[id] without comment field', async function () {
                const book = await makeBook();
                const response = await chai.request(server).post('/api/books/' + book._id).type('json').send({});
                assert.equal(response.status, 200);
                assert.equal(response.text, MSG.CREATE_COMMENT.MISSING);
                await book.delete();
            });

            test('Test POST /api/books/[id] with comment, id not in db', async function () {
                const comment = 'Why bother?';
                const response = await chai.request(server).post('/api/books/1234').type('json').send({comment});
                assert.equal(response.status, 200);
                assert.equal(response.text, MSG.CREATE_COMMENT.NO_BOOK);
            });

        });

        suite('DELETE /api/books/[id] => delete book object id', function () {

            test('Test DELETE /api/books/[id] with valid id in db', async function () {
                const newBook = new Book({title: 'Umm Jammer Lammy'});
                await newBook.save();
                assert.isDefined(newBook._id);

                const response = await chai.request(server).delete('/api/books/' + newBook._id)
                assert.equal(response.status, 200);
                assert.equal(response.text, MSG.DELETE_BOOK.SUCCESS);
                const dbCheck = await Book.findById(newBook._id).exec();
                assert.isNull(dbCheck, 'Book was not deleted: ' + JSON.stringify(dbCheck));
            });

            test('Test DELETE /api/books/[id] with  id not in db', async function () {
                const response = await chai.request(server).delete('/api/books/1234')
                assert.equal(response.status, 200);
                assert.equal(response.text, MSG.DELETE_BOOK.NO_BOOK);
            });

        });

    });

});
