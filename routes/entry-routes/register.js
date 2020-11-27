const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const usersCollection = '_users';

/* GET register page. */
router.get('/', function(req, res, next) {
    res.render('entry/register');
});

/* POST register form */
router.post('/', (req, res) => {

    req.body.username = req.body.username[0] === '@'
    ? req.body.username : "@" + req.body.username;

    db.getDB().collection(usersCollection).insertOne(req.body, (err, data) => {
        if (err) console.log(err);
        else res.json(data.result);
    });
});

module.exports = router;