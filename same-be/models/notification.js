var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var notifSchema = new Schema({
    userID: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    postID: {
        type: String
    },
    byID: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    }
});

notifSchema.index({
    userID: 1,
    posted: -1
});

var Notif = mongoose.model('Notification', notifSchema);

module.exports = Notif;