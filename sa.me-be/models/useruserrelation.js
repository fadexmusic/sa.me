var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var useruserSchema = new Schema({
  followerID: { type: String, required: true },
  followsID: { type: String, required: true }
});

var UseruserRelation = mongoose.model('Useruserrelation', useruserSchema);

module.exports = UseruserRelation;