const MongoClient = require('mongodb');
const debug = require('debug')('oss-auth-server:db');

const host = process.env.MONGO_HOST || 'localhost';
const port = process.env.MONGO_PORT || 27017;
const dbName = process.env.MONGO_DB_NAME || 'oss-auth-server';
const usersOptions = {
  validator: {
    $and: [
      { phone: { $type: 'string', $exists: true } },
      { email: { $regex: /^.+@.+$/, $exists: true } },
    ]
  }
};
const secretsOptions = {
  validator: {
    $and: [
      { secret: { $type: 'string', $exists: true } },
      { email: { $regex: /^.+@.+$/, $exists: true } },
    ]
  }
};

function initMongoDb(app) {
  return connect()
    .then((db) => {
      debug('connected');
      // propagate "db" into each request
      app.use((req, res, next) => {
        req.db = db;
        next();
      });
      return createCollection(db, 'users', usersOptions)
        .then(() => {
          const users = db.collection('users');
          users.createIndex({ email: 1 }, { unique: true });
          return createCollection(db, 'secrets', secretsOptions)
            .then(() => {
              const secrets = db.collection('secrets');
              secrets.createIndex({ email: 1 }, { unique: true });
              return db;
            });
        });
    });
}

function connect() {
  return new Promise((resolve, reject) => {
    const url = `mongodb://${host}:${port}/${dbName}`;
    debug(`connecting to ${url}`);
    MongoClient.connect(url, (err, db) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
}

function createCollection(db, name, options) {
  return new Promise((resolve, reject) => {
    db.createCollection(name, options, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

module.exports = initMongoDb;
