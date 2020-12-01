const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const usersCollection = '_users';

/* GET login page. */
router.get('/', function (req, res, next) {
    if (req.session.valid) {
        console.log('Ready to enter the chat!'); // Redirection to chat page
    } else req.session.destroy(err => {
        if (err) console.log(err);
    });
    res.render('entry/login');
});

/* POST login request */
router.post('/', (req, res) => {
    console.log(req.body)
    db.getDB().collection(usersCollection).find(req.body).toArray((err, documents) => {
        if (err) console.log(err);
        else if (documents.length) {
            req.session.valid = true;
            req.session.user = documents[0];
            res.json({
                ok: 1
            });
        } else res.json({
                ok: 0,
                description: "username or password is wrong!\n\nTry again."
            });
    });
});

module.exports = router;