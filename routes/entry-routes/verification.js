const express = require('express');
const router = express.Router();

/* GET verification page. */
router.get('/', function(req, res, next) {
    res.render('entry/verification');
});

module.exports = router;