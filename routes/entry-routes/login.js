const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const usersCollection = '_users';

/* GET login page. */
router.get('/', function (req, res, next) {
    if (req.session.hasOwnProperty('valid')) {
        // Redirection to chat page
        res.writeHead(301, {
            Location: 'http://localhost:3000/chat'
        });
        res.end();
        return;
    } else req.session.destroy(err => {
        if (err) console.log(err);
    });
    res.render('entry/login');
});

/* POST login request */
router.post('/', (req, res) => {

    req.body.username = req.body.username[0] === '@'
        ? req.body.username : "@" + req.body.username;

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