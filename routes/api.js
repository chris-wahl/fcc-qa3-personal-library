/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';
const assert = require('chai').assert;
const Book = require('../models/book');
const ObjectId = require('mongoose').Types.ObjectId;
const MSG = require('../constants');

module.exports = function (app) {

    app.route('/api/books')
        .get(async function (req, res) {
            const books = await Book.find({}).select({title: 1, _id: 1, comments: 1});
            return res.json(books.map(b => ({
                _id: b._id,
                title: b.title,
                commentcount: b.comments.length
            })));
        })
        .post(async function (req, res) {
            const title = req.body.title;

            if (!title) {
                return res.send(MSG.CREATE_BOOK_MISSING);
            }

            //response will contain new book object including atleast _id and title
            const existingBook = await Book.findOne({title});
            if (!!existingBook) {
                return res.json({_id: existingBook._id, title});
            }

            const book = new Book({title});
            await book.save();
            return res.json({
                _id: book._id,
                title
            });
        })
        .delete(async function (req, res) {
            await Book.deleteMany({});
            return res.send(MSG.DELETE_ALL);
        });


    app.route('/api/books/:id')
        .get(async function (req, res) {
            try {
                const _id = ObjectId(req.params.id);
                const book = await Book.findOne({_id}).select({title: 1, _id: 1, comments: 1});
                assert.isNotNull(book);
                return res.json(book);
            } catch (e) {
                return res.send(MSG.GET_BOOK_NO_BOOK);
            }

        })
        .post(async function (req, res) {
            try {
                const _id = ObjectId(req.params.id);
                const comment = req.body.comment;
                if (!comment) {
                    return res.send(MSG.CREATE_COMMENT.MISSING);
                }
                const book = await Book.findById(_id);
                assert.isNotNull(book);
                book.comments.push(comment);
                await book.save();
                return res.json({
                    _id,
                    title: book.title,
                    comments: book.comments
                });
            } catch {
                return res.send(MSG.CREATE_COMMENT.NO_BOOK);
            }
        })

        .delete(async function (req, res) {
            try {
                const _id = ObjectId(req.params.id);
                const result = await Book.findOneAndDelete({_id});
                assert.isNotNull(result);
                return res.send(MSG.DELETE_BOOK.SUCCESS);
            } catch {
                return res.send(MSG.DELETE_BOOK.NO_BOOK);
            }

        });

};
