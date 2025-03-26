const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userID: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    cookie: {
        type: String,
        required: true
    },
    expirationDate: {
        type: Date,
        required: true
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;