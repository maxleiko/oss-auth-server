const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  email:  { type: String, unique: true, required: true, dropDups: true },
  phone:  { type: String },
});

UserSchema.index({ email: 1 });

module.exports = mongoose.model('User', UserSchema);
