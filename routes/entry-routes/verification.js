const express = require('express');
const router = express.Router();

/* GET verification page. */
router.get('/', function (req, res) {
    if (!req.session.user) {
        res.writeHead(301, {
            Location: 'http://localhost:3000/login'
        });
        res.end();
        return;
    }
    console.log(req.session.auth);
    res.render('entry/verification');
});

/* POST request for code verification */
router.post('/', (req, res) => {
    if (req.session.auth === Number(req.body.code)) {
        res.writeHead(301, {
            Location: 'http://localhost:3000/new-password'
        });
        res.end();
    } else {
        const message = 'Wrong code!\nEnter the code sent to your email.';
        res.type('html');
        res.write(
            `<body style="background-color: #1D1F20; margin: 200px auto; text-align: center">` +
            `<h2 style="color: whitesmoke">${message}</h2>` +
            `<script>setTimeout(() => window.location.href = "/verification", 4000)</script></body>`
        );
        res.end();
    }
});

module.exports = router;