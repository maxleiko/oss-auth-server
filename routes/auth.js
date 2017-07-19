const express = require('express');
const router = express.Router();
const passport = require('passport');

const secretService = require('../lib/secret-service');

const Secret = require('../model/Secret');

router.get('/qrcode', (req, res, next) => {
  Secret.findOne({ _id: req.query.id })
    .then((secret) => {
      if (secret) {
        return secretService().qrcode(secret.key)
          .then((dataURL) => {
            res.render('pages/auth/qrcode', {
              title: 'QRCode - OSS Auth Server',
              qrcode: dataURL,
              active: null,
              unknown: false,
            });
          });
      } else {
        res.render('pages/auth/qrcode', {
          title: 'QRCode - OSS Auth Server',
          active: null,
          id: req.query.id,
          unknown: true
        });
      }
    })
    .catch(next);
});

router.get('/login', (req, res) => {
  res.render('pages/auth/login', {
    title: 'Login - OSS Auth Server',
    active: 'home',
    error: null
  });
});

router.post('/login', passport.authenticate('custom', { failureRedirect: '/auth/login' }), (req, res) => {
  res.redirect('/');
});

module.exports = router;
