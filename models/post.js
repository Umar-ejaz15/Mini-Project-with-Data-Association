const mongoose = require('mongoose');

const post = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    name: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    content:String,
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    date: {
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model('post', post)