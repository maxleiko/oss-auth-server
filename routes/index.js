const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('pages/index', {
    title: 'Home - OSS Auth Server',
    active: 'admin'
  });
});

module.exports = router;
