const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const speakeasy = require('speakeasy');

const userService = require('../lib/user-service');
const secretService = require('../lib/secret-service');

router.get('/qrcode', (req, res) => {
  const opts = {
    rendererOpts: {
      quality: 1
    }
  };
  QRCode.toDataURL('otpauth://totp/oss-auth-server?secret=' + req.query.secret, opts, (err, dataURL) => {
    res.render('pages/auth/qrcode', {
      title: 'QRCode - OSS Auth Server',
      qrcode: dataURL,
      active: null
    });
  });
});

router.post('/login', (req, res) => {
  userService(req.db).getByEmail(req.body.email)
    .then((user) => {
      secretService(req.db).get(user.email)
        .then((doc) => {
          console.log('EMAIL=' + user.email);
          console.log('SECRET=' + doc.secret);
          console.log('TOKEN=' + req.body.token);
          const verified = speakeasy.totp.verify({
            secret: doc.secret,
            encoding: 'base32',
            token: parseInt(req.body.token, 10)
          });
          console.log('VERIFIED=' + verified);
          res.render('pages/auth/login', {
            title: 'Login - OSS Auth Server',
            active: 'home',
            success: verified,
            user: {
              email: user.email,
              phone: user.phone
            }
          });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).render('pages/auth/login', {
        title: 'Login - OSS Auth Server',
        active: 'home',
        success: false
      });
    });
});

module.exports = router;
