const express = require('express');
const router = express.Router();
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;


/* GET home page. */
router.get('/',   passport.authenticate('basic', { session: false }),
(req, res) => {
  res.render('pages/index', {
    title: 'Home - OSS Auth Server',
    active: 'home'
  });
});

module.exports = router;
