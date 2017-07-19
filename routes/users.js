const express = require('express');
const router = express.Router();
const debug = require('debug')('oss-auth-server:users');

const mailService = require('../lib/mail-service');
const secretService = require('../lib/secret-service');
const User = require('../model/User');
const Secret = require('../model/Secret');

const baseUrl = process.env.BASE_URL || 'http://localhost:' + (process.env.PORT || 3000);

/* GET user by id */
router.get('/:id', (req, res, next) => {
  User.findOne({ _id: req.params.id })
    .then((user) => {
      res.render('pages/users/show', {
        title: 'User - OSS Auth Server',
        active: 'users',
        user: user,
      });
    })
    .catch(next);
});

/* GET users listing. */
router.get('/', (req, res, next) => {
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
});

/* POST create new user */
router.post('/', (req, res, next) => {
  const key = secretService().create();
  const user = new User({ email: req.body.email, phone: req.body.phone });
  user.save()
    .then(() => {
      const secret = new Secret({ email: user.email, key: key });
      return secret.save();
    })
    .then((secret) => {
      secret.creationDate.setHours(secret.creationDate.getHours() + 24);
      return mailService(baseUrl).send(user.email, '/auth/qrcode?id=' + secret._id, secret.creationDate);
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
});

/* DELETE user */
router.delete('/:id', (req, res, next) => {
  User.remove({ _id: req.params.id })
    .then(() => {
      res.sendStatus(200);
    })
    .catch(next);
});

/* DELETE all users */
router.delete('/', (req, res, next) => {
  User.remove()
    .then(() => {
      res.sendStatus(200);
    })
    .catch(next);
});

module.exports = router;
