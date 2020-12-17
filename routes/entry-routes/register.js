const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const usersCollection = '_users';

/* GET register page. */
router.get('/', function (req, res) {
    res.render('entry/register');
});

/* POST register form */
router.post('/', (req, res) => {

    // Adding groups field
    req.body.groups = "";
    let endOfResponse = false;

    const validateObject = validate(req);
    if (!validateObject.valid) {
        res.json(validateObject);
        return;
    }

    hasDuplicateEmail(req).then(response => {
        return JSON.parse(JSON.stringify(response));
    }).then(jsonResponse => {
        if (jsonResponse.duplicate) {
            res.json(jsonResponse);
            endOfResponse = true;
        }
    }).catch(err => {
        res.json(err);
    });

    req.body.username = req.body.username[0] === '@'
        ? req.body.username : "@" + req.body.username;

    hasDuplicateUsername(req).then(response => {
        return JSON.parse(JSON.stringify(response));
    }).then(jsonResponse => {
        if (endOfResponse) return;
        if (jsonResponse.duplicate) {
            res.json(jsonResponse);
        } else {
            db.getDB().collection(usersCollection).insertOne(req.body, (err, data) => {
                if (err) console.log(err);
                else res.json(data.result);
            });
        }
    }).catch(err => {
        res.json(err);
    });
});

function validate(req) {

    const invalidChars = "\"!#~$%^&*()+{}|-=[]\\\\/\\',<>?\\\"";
    req.body.email = req.body.email.toLowerCase();
    req.body.username = req.body.username.toLowerCase();

    if (req.body.first_name === '' || req.body.username === '' || req.body.password === '')
        return {
            ok: 0,
            n: 0,
            valid: false,
            reason: 'Please fill out all the fields!'
        };

    if (!(req.body.email.includes('@') && req.body.email.includes('.')
        && req.body.email.indexOf('@') < req.body.email.lastIndexOf('.'))) {
        return {
            ok: 0,
            n: 0,
            valid: false,
            reason: "Email is not valid!"
        }
    }

    for (const char of invalidChars)
        if (req.body.username.includes(char))
            return {
                ok: 0,
                n: 0,
                valid: false,
                reason: `Username contains the invalid character: '${char}'`
            };

    if (req.body.username[0] === '_')
        return {
            ok: 0,
            n: 0,
            valid: false,
            reason: "Username must not start with '_'"
        };

    if (req.body.username.indexOf('@') > 0)
       return {
           ok: 0,
           n: 0,
           valid: false,
           reason: 'Username contains invalid char in an invalid position'
       };

    const numbers = '0123456789';
    if (numbers.includes(req.body.username[0]))
        return {
            ok: 0,
            n: 0,
            valid: false,
            reason: "Username must not start with a number!"
        };

    if (req.body.username.length < 5) {
        return {
            ok: 0,
            n: 0,
            valid: false,
            reason: "Username must be at least 5 characters!"
        };
    }
    return {
        valid: true
    };
}

function hasDuplicateEmail(req) {
    let duplicateObject = {
        duplicate: false
    }
    return new Promise((resolve, reject) => {
        db.getDB().collection(usersCollection).find({email: req.body.email}).toArray((err, documents) => {
            if (err) {
                console.log(err);
                return reject(err);
            } else if (documents.length) {
                duplicateObject = {
                    ok: 0,
                    n: 0,
                    reason: `An account with the email: ${req.body.email} already exists!`,
                    duplicate: true
                }
            }
            return resolve(duplicateObject);
        });
    });
}

function hasDuplicateUsername(req) {
    let duplicateObject = {
        duplicate: false
    }
    return new Promise((resolve, reject) => {
        db.getDB().collection(usersCollection).find({username: req.body.username}).toArray((err, documents) => {
            if (err) {
                console.log(err);
                return reject(err);
            } else if (documents.length) {
                duplicateObject = {
                    ok: 0,
                    n: 0,
                    reason: `The username: ${req.body.username} is already copied!`,
                    duplicate: true
                }
            }
            return resolve(duplicateObject);
        });
    });
}

module.exports = router;