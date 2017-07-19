const mongoose = require('mongoose');

const SecretSchema = mongoose.Schema({
  email:        { type: String, unique: true, required: true, dropDups: true },
  key:          { type: String },
  creationDate: { type: Date, default: Date.now(), expires: 60 * 60 * 24 } // TTL 24 hours
});

SecretSchema.index({ email: 1 });

module.exports = mongoose.model('Secret', SecretSchema);
