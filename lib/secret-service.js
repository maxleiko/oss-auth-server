const speakeasy = require('speakeasy');

function secretService(db) {
  const secrets = db.collection('secrets');

  return {
    get(email) {
      return new Promise((resolve, reject) => {
        secrets.findOne({ email: email }, promiseCb(resolve, reject));
      });
    },

    create(email) {
      const secret = speakeasy.generateSecret();
      return new Promise((resolve, reject) => {
        secrets.insertOne({ secret: secret.base32, email: email }, promiseCb(resolve, reject));
      }).then(() => secret.base32);
    }
  };
}

function promiseCb(resolve, reject) {
  return (err, result) => {
    if (err) {
      reject(err);
    } else {
      resolve(result);
    }
  };
}

module.exports = secretService;
