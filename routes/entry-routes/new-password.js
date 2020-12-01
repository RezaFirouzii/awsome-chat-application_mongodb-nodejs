const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const usersCollection = '_users';

/* GET new-password page */
router.get('/', (req, res) => {
    if (!req.session.user) {
        res.writeHead(301, {
            Location: 'http://localhost:3000/login'
        });
        res.end();
        return;
    }
    res.render('entry/new-password');
    console.log(req.session.user);
});

/* PUT request for new password */
router.put('/', (req, res) => {
    try {
        db.getDB().collection(usersCollection).findOneAndUpdate({_id: db.getPrimaryKey(req.session.user._id)}, {$set: {password: req.body.pass}}, {returnOriginal: false}, (err, result) => {
            if (err) console.log(err);
            else res.json({
                ok: 1,
                n: 1,
                description: 'Password updated successfully!'
            });
        });
    } catch (e) {
        res.json(res.json({
            ok: 0,
            n: 0,
            description: `Session ended. log in or sign up please!`
        }));
    }
});

module.exports = router;