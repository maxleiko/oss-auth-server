const express = require('express');
const router = express.Router();
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;

const userService = require('../lib/user-service');
const nodemailer = require('nodemailer');

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');


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
  var secret = speakeasy.generateSecret({length: 20});
  console.log(secret.base32); // secret of length 20

  QRCode.toDataURL(secret.otpauth_url, function(err, data_url) {
    console.log(data_url); // get QR code data URL

  });

  userService(req.db).create(req.body.email, req.body.phone, secret.base32 )
    .then((user) => {
      // setup email data with unicode symbols
      QRCode.toDataURL(secret.otpauth_url, function(err, data_url) {
        let mailOptions = {
            from: '"Olivier Barais" <barais@irisa.fr>', // sender address
            to: req.body.email, // list of receivers
            subject: 'Your access to OSS Web Site', // Subject line
            html: '<b>Hello, if you want to access the OSS web site, please scan the following QR code available at this <a href="'+data_url+ '">URL</a> using <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=fr">google authentificator</a>. Next you can access the web site directly <a href="http://localhost:3000">here</a> and use the app to authentificate</b>' // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });

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
