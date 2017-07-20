const express = require('express');
const router = express.Router();
const debug = require('debug')('oss-auth-server:users');
const crypto = require('crypto');

const mailService = require('../lib/mail-service');
const secretService = require('../lib/secret-service');
const User = require('../model/User');
const Secret = require('../model/Secret');
const TemporaryURLSecretMapping = require('../model/TemporaryURLSecretMapping');
const baseUrl = process.env.BASE_URL || 'http://localhost:' + (process.env.PORT || 3000);

/* GET user by id */
router.get('/:id', (req, res, next) => {
  if (req.user.admin){
  User.findOne({ _id: req.params.id })
    .then((user) => {
      res.render('pages/users/show', {
        title: 'User - OSS Auth Server',
        active: 'users',
        user: user,
      });
    })
    .catch(next);
  }
  else{
    res.sendStatus(403);
  }

});

/* GET users listing. */
router.get('/', (req, res, next) => {
  if (req.user.admin){
  User.find()
    .then((users) => {
      res.render('pages/users/index', {
        title: 'Users - OSS Auth Server',
        active: 'users',
        users: users,
        error: null
      });
    })
    .catch(next);
    }
    else{
      res.sendStatus(403);
    }
});

/* POST create new user */
router.post('/', (req, res, next) => {
  if (req.user.admin){
  const key = secretService().create();
  const user = new User({ email: req.body.email, phone: req.body.phone, admin: req.body.admin });
  user.save()
    .then(() => {
      const secret = new Secret({ email: user.email, key: key });
      return secret.save();
    }).then((secret) => {
        const mapping = new TemporaryURLSecretMapping({urlkey:crypto.randomBytes(24).toString('hex'),key:key});
        mapping.save();
    })
    .then((mapping) => {
      mapping.creationDate.setHours(mapping.creationDate.getHours() + 24);
      return mailService(baseUrl).send(user.email, '/auth/qrcode?id=' + mapping.urlkey, secret.creationDate);
    })
    .then(() => {
      res.status(201).render('pages/users/created', {
        title: 'Users - OSS Auth Server',
        active: 'users',
        user: user,
      });
    })
    .catch((err) => {
      debug(err);
      User.find()
        .then((users) => {
          res.status(400).render('pages/users/index', {
            title: 'Users - OSS Auth Server',
            active: 'users',
            users: users,
            error: err.message
          });
        });
    })
    .catch(next);
  }
  else{
    res.sendStatus(403);
  }

});

/* DELETE user */
router.delete('/:id', (req, res, next) => {
  if (req.user.admin){
  //TODO Delete also the secret for this user
  User.remove({ _id: req.params.id })
    .then(() => {
      res.sendStatus(200);
    })
    .catch(next);
  }
  else{
    res.sendStatus(403);
  }

});

/* DELETE all users and all sectets */
router.delete('/', (req, res, next) => {
  if (req.user.admin){
  Secret.remove().then(() => {
    User.remove()
      .then(() => {
        res.sendStatus(200);
      })
      .catch(next);
  }).catch(next);
}
else{
  res.sendStatus(403);
}

});

module.exports = router;
