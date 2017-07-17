const express = require('express');
const router = express.Router();

const userService = require('../lib/user-service');

/* GET user by id */
router.get('/:id', (req, res) => {
  userService(req.db).get(req.params.id)
    .then((user) => {
      console.log("ID:", req.params.id);
      console.log(user);
      res.render('pages/users/show', {
        title: 'User - OSS Auth Server',
        active: 'users',
        user: user
      });
    });
});

/* GET users listing. */
router.get('/', (req, res) => {
  userService(req.db).getAll()
    .then((users) => {
      res.render('pages/users/list', {
        title: 'Users - OSS Auth Server',
        active: 'users',
        users: users
      });
    });
});

/* POST create new user */
router.post('/', (req, res) => {
  userService(req.db).create(req.body.email, req.body.phone)
    .then((user) => {
      res.status(201).render('pages/users/created', {
        title: 'Users - OSS Auth Server',
        active: 'users',
        user: user
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
