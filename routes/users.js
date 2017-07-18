const express = require('express');
const router = express.Router();
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;

const userService = require('../lib/user-service');
const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: 'smtp.inria.fr',
    port: 587,
    secure: false, // secure:true for port 465, secure:false for port 587
    auth: {
        user: 'barais',
        pass: '*****'
    }
});


/* GET user by id */
router.get('/:id',  passport.authenticate('basic', { session: false }),
(req, res) => {
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
router.get('/',  passport.authenticate('basic', { session: false }),
(req, res) => {
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
router.post('/',  passport.authenticate('basic', { session: false }),
(req, res) => {
  userService(req.db).create(req.body.email, req.body.phone)
    .then((user) => {
      // setup email data with unicode symbols
      let mailOptions = {
          from: '"Olivier Barais" <barais@irisa.fr>', // sender address
          to: 'olivier.barais@irisa.fr', // list of receivers
          subject: 'Hello ✔', // Subject line
          text: 'Hello world ?', // plain text body
          html: '<b>Hello world ?</b>' // html body
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
          console.log('Message %s sent: %s', info.messageId, info.response);
      });

      res.status(201).render('pages/users/created', {
        title: 'Users - OSS Auth Server',
        active: 'users',
        user: user
      });
    });
});

/* DELETE user */
router.delete('/:id',  passport.authenticate('basic', { session: false }),
(req, res) => {
  userService(req.db).remove(req.params.id)
    .then(() => {
      res.sendStatus(200);
    });
});

module.exports = router;
