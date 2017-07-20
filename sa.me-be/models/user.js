var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  avatar: {
    type: String,
    default: 'https://betruewebdesign.com/img/avatar-300x300.png'
  },
  password: {
    type: String,
    required: true
  },
  followers: {
    type: Number,
    default: 0
  }
});

var User = mongoose.model('User', userSchema);

module.exports = User;