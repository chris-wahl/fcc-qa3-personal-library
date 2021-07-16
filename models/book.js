const mongoose = require('mongoose');

mongoose.connect(process.env['DB'], {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    comments: {
        type: [String],
        default: []
    }
});

const Book = new mongoose.model('Book', bookSchema);

module.exports = Book;
