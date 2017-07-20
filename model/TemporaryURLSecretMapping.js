const mongoose = require('mongoose');

const TemporaryURLSecretMappingSchema = mongoose.Schema({
  urlkey:       { type: String },
  key:          { type: String },
  creationDate: { type: Date, default: Date.now(), expires: 60 * 60 * 24 } // TTL 24 hours
});

SecretSchema.index({ urlkey: 1 });

module.exports = mongoose.model('TemporaryURLSecretMapping', TemporaryURLSecretMappingSchema);
