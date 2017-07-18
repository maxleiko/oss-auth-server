const express = require('express');
const router = express.Router();
const debug = require('debug')('oss-auth-server:users');

const userService = require('../lib/user-service');
const mailService = require('../lib/mail-service');
const secretService = require('../lib/secret-service');

const baseUrl = process.env.BASE_URL || 'http://localhost:' + (process.env.PORT || 3000);

/* GET user by id */
router.get('/:id', (req, res) => {
  userService(req.db).get(req.params.id)
    .then((user) => {
      res.render('pages/users/show', {
        title: 'User - OSS Auth Server',
        active: 'users',
        user: user,
      });
    });
});

/* GET users listing. */
router.get('/', (req, res) => {
  userService(req.db).getAll()
    .then((users) => {
      res.render('pages/users/index', {
        title: 'Users - OSS Auth Server',
        active: 'users',
        users: users,
        error: null
      });
    });
});

/* POST create new user */
router.post('/', (req, res) => {
  userService(req.db).create(req.body.email, req.body.phone)
    .then((user) => {
      return secretService(req.db).create(req.body.email)
        .then((secret) => {
          const expirationDate = new Date();
          expirationDate.setHours(expirationDate.getHours() + 24);
          return mailService(baseUrl).send(user.email, '/auth/qrcode?secret=' + secret.base32, expirationDate)
            .then(() => user);
        });
    })
    .then((user) => {
      res.status(201).render('pages/users/created', {
        title: 'Users - OSS Auth Server',
        active: 'users',
        user: user,
      });
    })
    .catch((err) => {
      debug(err);
      userService(req.db).getAll()
        .then((users) => {
          res.status(400).render('pages/users/index', {
            title: 'Users - OSS Auth Server',
            active: 'users',
            users: users,
            error: err.message
          });
        });
    });
});

/* DELETE user */
router.delete('/:id', (req, res) => {
  userService(req.db).remove(req.params.id)
    .then(() => {
      res.sendStatus(200);
    });
});

module.exports = router;
