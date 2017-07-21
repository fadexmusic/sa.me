var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
    byID: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: null
    },
    posted: {
        type: Date,
        default: Date.now
    },
    sames: {
        type: Number,
        default: 0
    },
    notsames: {
        type: Number,
        default: 0
    }
});

var Post = mongoose.model('Post', postSchema);

module.exports = Post;