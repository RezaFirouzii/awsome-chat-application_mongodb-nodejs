const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const usersCollection = '_users';

/* GET forgot password page. */
router.get('/', function(req, res, next) {
    res.render('entry/forgot-password');
});

/* POST email (forgot password) */
router.post('/', (req, res) => {
    db.getDB().collection(usersCollection).find(req.body).toArray((err, documents) => {
        if (err) console.log(err);
        else if (documents.length) {
            const securityCode = Math.floor(Math.random() * 100000) + 10000;
            // we should now send the security code to user!
        } else {
            res.json({
                ok: 0,
                n: 0,
                reason: 'No user found with the provided email.'
            });
        }
    })
});

module.exports = router;