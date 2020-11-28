const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const usersCollection = '_users';
const nodeMailer = require('nodemailer');

// Your Email account info
const myInfo = {
    email: '<Your Email>',
    password: '<Your Password>'
}

/* GET forgot password page. */
router.get('/', function(req, res) {
    res.render('entry/forgot-password');
});

/* POST email (forgot password) */
router.post('/', (req, res) => {
    db.getDB().collection(usersCollection).find(req.body).toArray((err, documents) => {
        if (err) console.log(err);
        else if (documents.length) {
            const user = documents[0];
            const code = sendEmail(user);
            req.session.user = user;
            req.session.auth = code;
            res.writeHead(301, {
                Location: 'http://localhost:3000/verification?status=sent&verified=false'
            });
            res.end();
        }
    });
});

/* POST request for code verification */
router.post('/', (req, res) => {
    if (req.session.code === req.body.code) {
        delete req.session.auth;
    } else {
        res.json({
            ok: 0,
            reason: 'Wrong code!\nEnter the code sent to your email.'
        });
    }
});

function sendEmail(user) {

    // A 5 digit number as security code
    const securityCode = Math.floor(Math.random() * 100000) + 10000;

    // // Making a transporter
    // const transporter = nodeMailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //         user: myInfo.email,
    //         pass: myInfo.password
    //     }
    // });
    //
    // const mailOptions = {
    //     from: myInfo.email,
    //     to: user.email,
    //     subject: 'Reza Firouzi | Awesome chat application',
    //     html: `<h2 style="color: red">Account Verification</h2>` +
    //           `<h4>Hi there!</h4>` +
    //           `<h4>&#128308; Your account in awesome chat application developed by <a href="https://github.com/RezaFirouzii">Reza Firouzi</a> is exposed at risk!</h4>` +
    //           `<h4>Your verification code is <u><b><i style="color: blue">${securityCode}</i></b></u></h4>` +
    //           `<h4>Set your new password and enjoy!</h4><br><br>` +
    //           `<h3>&#9888; If you never took a part in awesome chat app and you do not have any account, simply ignore this message.</h3>`
    // };
    //
    // transporter.sendMail(mailOptions, function(error, info) {
    //     if (error) {
    //         console.log(error);
    //     } else {
    //         console.log('Email sent: ' + info.response);
    //     }
    // });

    return securityCode;
}

module.exports = router;