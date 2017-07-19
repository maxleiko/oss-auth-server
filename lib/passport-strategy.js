const CustomStrategy = require('passport-custom');
const speakeasy = require('speakeasy');

const User = require('../model/User');
const Secret = require('../model/Secret');

const strategy = new CustomStrategy((req, done) => {
  if (req.user) {
    // TODO security check on the cookie <-> user
    done(null, req.user);
  } else {
    const email = req.body.email;
    const token = req.body.token;
    User.findOne({ email: email })
      .then((user) => {
        if (user) {
          Secret.findOne({ email: email })
            .then((secret) => {
              if (secret) {
                const verified = speakeasy.totp.verify({
                  secret: secret.key,
                  encoding: 'base32',
                  token: token
                });

                if (verified) {
                  console.log(' => valid');
                  done(null, user);
                } else {
                  console.log(' => wrong token');
                  done(null, false, 'wrong token');
                }
              } else {
                console.log(' => missing secret');
                done(null, false, 'missing secret');
              }
            });
        } else {
          console.log(' => user unknown');
          done(null, false, 'user unknown');
        }
      })
      .catch(() => done(null, false));
  }
});

module.exports = strategy;
