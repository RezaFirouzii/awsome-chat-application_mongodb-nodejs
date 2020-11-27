const express = require('express');
const router = express.Router();

/* GET forgot password page. */
router.get('/', function(req, res, next) {
    res.render('entry/forgot-password');
});

module.exports = router;