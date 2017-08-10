var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var feedSchema = new Schema({
    followerID: {
        type: String,
        required: true
    },
    postID: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});
feedSchema.index({posterID : 1, date : -1});

var Feed = mongoose.model('Feed', feedSchema);

module.exports = Feed;