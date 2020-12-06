const express = require('express');
const router = express.Router();
const cloud = require('cloudinary').v2;
const fs = require('fs');
const formidable = require('formidable');
const db = require('../../config/db');
const usersCollection = '_users';
const groupsCollection = '_groups';

/* GET Chat Home page */
router.get('/', (req, res) => {
    if (req.session.hasOwnProperty('valid')) {
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

    const userGroups = [];
    const joinedGroup = {};

    // data to be sent => [ { php, logo, admin, members[], messages[] } , { js, logo, admin, members[], messages[] } , ... ]

    new Promise((resolve) => {
        db.getDB().collection(usersCollection).find({ _id: db.getPrimaryKey(req.session.user._id)}).toArray((err, documents) => {
            if (err) console.log(err);
            else if (documents.length) {
                // IDs of groups which user has joined
                req.session.user.groups = documents[0].groups;
            }
            return resolve(req.session.user.groups.split(','));
        });
    }).then(response => {
        return JSON.parse(JSON.stringify(response));
    }).then(groups => {
        new Promise((resolve) => {
            groups.pop();
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
                    setTimeout(() => resolve(userGroups), 50);
                }).catch(e => {
                    console.log(e);
                });
            }
        }).then(response => {
            return JSON.parse(JSON.stringify(response));
        }).then(userGroups => {
            res.json({
                user: {
                    name: req.session.user.name,
                    last_name: req.session.user.last_name,
                    username: req.session.user.username,
                    groups: userGroups
                }
            });
        }).catch(e => {
            console.log(e);
        });
    });
});

/* GET add group page */
router.get('/add-group', (req, res) => {
    res.render('chat/new-group');
});

/* POST request for creating a new group */
router.post('/add-group', (req, res) => {

    console.log(req.body);
    const newGroup = {
        name: req.body.name,
        admin: req.session.user.username,
        members: req.session.user.username + ','
    }
    // Adding the new group as a doc to _groups collection
    db.getDB().collection(groupsCollection).insertOne(newGroup, (err, data) => {
        if (err) console.log(err);
        else {
            const groupID = data.insertedId;

            // Creating the collection of the new group
            db.getDB().createCollection(String(groupID), (err, result) => {
                if (err) console.log(err);
            });

            // Updating admin's joined groups
            db.getDB().collection(usersCollection).findOneAndUpdate(
                {_id: db.getPrimaryKey(req.session.user._id)},
                {$set: { groups: req.session.user.groups + groupID + ","}},
                {returnOriginal: false}, (err, result) => {
                    if (err) console.log(err);
                    else res.json({ok: 1});
                });
        }
    });
});

module.exports = router;