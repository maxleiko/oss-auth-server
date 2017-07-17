const MongoClient = require('mongodb');
const debug = require('debug')('oss-auth-server:db');

const mongoUrl = `mongodb://${process.env.MONGO_HOST || 'localhost'}:${process.env.MONGO_PORT || 27017}/${process.env.MONGO_DB_NAME || 'oss-auth-server'}`;
debug('connecting to ' + mongoUrl);
module.exports = function initMongoDb(app, done) {
  MongoClient.connect(mongoUrl, (err, db) => {
    if (err) {
      throw err;
    } else {
      debug('connected');
      db.createCollection('users', {
          validator: {
            '$or': [
              { phone: { '$type': 'string' } },
              { email: { '$regex': /^.+@.+$/ } }
            ]
          }
        },
        function (err) {
          if (err) {
            throw err;
          } else {
            app.use((req, res, next) => {
              req.db = db;
              next();
            });
            done();
          }
        }
      );
    }
  });
};
