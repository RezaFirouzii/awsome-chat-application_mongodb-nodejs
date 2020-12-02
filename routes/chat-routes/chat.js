const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const groupsCollection = '_groups';

/* GET Chat Home page */
router.get('/', (req, res) => {
    if (req.session.valid) {
        let {first_name, last_name, username} = req.session.user;
        res.render('chat/chat', {
            first_name, last_name, username
        });
    } else {
        res.writeHead(301, {
            Location: 'http://localhost:3000/login'
        });
        res.end();
    }
});

/* Rendering Info by API */
router.get('/render', (req, res) => {

    let groups = req.session.user.groups;
    groups = groups.split(','); // IDs of groups which user has joined

    // data to be sent => [ { php, logo, admin, members[], messages[] } , { js, logo, admin, members[], messages[] } , ... ]

    const userGroups = [];
    const joinedGroup = {};

    new Promise((resolve) => {
        for (let i = 0; i < groups.length; i++) {
            new Promise((resolve) => {

                const groupID = groups[i];
                if (groupID === '') return;

                db.getDB().collection(groupsCollection).find({_id: db.getPrimaryKey(groupID)}).toArray((err, documents) => {
                    if (err) console.log(err);
                    else if (documents.length) {
                        const group = documents[0];
                        joinedGroup.name = group.name;
                        joinedGroup.logo = group.name + groupID;
                        joinedGroup.admin = group.admin;
                        joinedGroup.members = group.members.split(',');
                        joinedGroup.members.pop();
                        joinedGroup.size = joinedGroup.members.length;

                        db.getDB().collection(groupID).find({}).toArray((err, documents) => {
                            if (err) console.log(err);
                            else if (documents.length) {
                                joinedGroup.messages = documents;
                            }
                        });
                    }
                    return resolve(joinedGroup);
                });
            }).then(response => {
                return JSON.parse(JSON.stringify(response));
            }).then(joinedGroup => {
                userGroups.push(joinedGroup);
                setTimeout(() => resolve(userGroups), 0);
            }).catch(e => {
                console.log(e);
            });
        }
    }).then(response => {
        return JSON.parse(JSON.stringify(response));
    }).then(userGroups => {
        res.json(userGroups);
    }).catch(e => {
        console.log(e);
    });
});

module.exports = router;