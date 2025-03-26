const mongoose = require('mongoose');

const puzzleSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true
    },
    editor: {
        type: String,
        required: true
    },
    format_type: {
        type: String,
        required: true
    },
    print_date: {
        type: Date,
        required: true
    },
    publish_type: {
        type: String,
        required: true
    },
    puzzle_id: {
        type: Number,
        required: true,
        unique: true
    },
    title: {
        type: String,
        default: ''
    },
    version: {
        type: Number,
        required: true
    },
    percent_filled: {
        type: Number,
        required: true
    },
    solved: {
        type: Boolean,
        required: true
    },
    star: {
        type: Boolean,
        default: null
    }
});

const Puzzle = mongoose.model('Puzzle', puzzleSchema);

module.exports = { Puzzle };