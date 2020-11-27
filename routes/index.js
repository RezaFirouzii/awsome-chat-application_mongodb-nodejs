const express = require('express');
const router = express.Router();

/* GET homepage. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Chat Application' });
});

module.exports = router;
