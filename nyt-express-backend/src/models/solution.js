const mongoose = require('mongoose');

const cellSchema = new mongoose.Schema({
    confirmed: {
        type: Boolean,
        default: false
    },
    guess: {
        type: String,
        default: ''
    },
    timestamp: {
        type: Number,
        default: null
    },
    blank: {
        type: Boolean,
        default: false
    },
    checked: {
        type: Boolean,
        default: false
    }
});

const boardSchema = new mongoose.Schema({
    cells: [cellSchema]
});

const calcsSchema = new mongoose.Schema({
    percentFilled: {
        type: Number,
        required: true
    },
    secondsSpentSolving: {
        type: Number,
        required: true
    },
    solved: {
        type: Boolean,
        required: true
    }
});

const firstsSchema = new mongoose.Schema({
    checked: {
        type: Number
    },
    cleared: {
        type: Number
    },
    opened: {
        type: Number
    },
    solved: {
        type: Number
    }
});

const solutionSchema = new mongoose.Schema({
    board: boardSchema,
    calcs: calcsSchema,
    firsts: firstsSchema,
    lastCommitID: {
        type: String,
        required: true
    },
    puzzleID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Puzzle',
        required: true
    },
    timestamp: {
        type: Number,
        required: true
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    minGuessTime: {
        type: Number,
    },
    lastSolve: {
        type: Number,
        required: true
    },
    autocheckEnabled: {
        type: Boolean
    }
});

const Solution = mongoose.model('Solution', solutionSchema);
module.exports = { Solution };