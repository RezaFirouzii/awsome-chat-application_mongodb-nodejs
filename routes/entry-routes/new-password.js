const express = require('express');
const router = express.Router();

/* GET new password page. */
router.get('/', function(req, res, next) {
    res.render('entry/new-password');
});

module.exports = router;