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
    default: 'https://i.imgur.com/uOL5qdB.png'
  },
  password: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: ""
  }
});
userSchema.index({username: 1})

var User = mongoose.model('User', userSchema);

module.exports = User;