const mongoose = require('mongoose');
const debug = require('debug')('oss-auth-server:db');

const host = process.env.MONGO_HOST || 'localhost';
const port = process.env.MONGO_PORT || 27017;
const dbName = process.env.MONGO_DB_NAME || 'oss-auth-server';

mongoose.Promise = Promise;

function initMongoDb(app) {
  return connect()
    .then((db) => {
      debug('connected');
      // propagate "db" into each request
      app.use((req, res, next) => {
        req.db = db;
        next();
      });
      return db;
    });
}

function connect() {
  return new Promise((resolve, reject) => {
    const url = `mongodb://${host}:${port}/${dbName}`;
    debug(`connecting to ${url}`);
    mongoose.connect(url, { useMongoClient: true });
    mongoose.connection.on('error', reject);
    mongoose.connection.on('open', () => resolve(mongoose.connection));
  });
}

module.exports = initMongoDb;
