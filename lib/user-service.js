const ObjectId = require('mongodb').ObjectId;

const promiseCb = (resolve, reject) => (err, result) => {
  if (err) {
    reject(err);
  } else {
    resolve(result);
  }
};

module.exports = function userService(db) {
  const users = db.collection('users');

  return {
    get(id) {
      return new Promise((resolve, reject) => {
        users.findOne({ _id: ObjectId(id) }, promiseCb(resolve, reject));
      });
    },

    getAll() {
      return new Promise((resolve, reject) => {
        users.find().toArray(promiseCb(resolve, reject));
      });
    },

    create(email, phone) {
      return new Promise((resolve, reject) => {
        const user = { email: email, phone: phone };
        users.insertOne(user, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(user);
          }
        });
      });
    },

    remove(id) {
      return new Promise((resolve, reject) => {
        users.deleteOne({ _id: ObjectId(id) }, promiseCb(resolve, reject));
      });
    }
  };
};
