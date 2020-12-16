const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const usersCollection = '_users';
const groupsCollection = '_groups';
const users = require('../../config/users');

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

    // user groups to be sent:
    // [ { name (str), image (str), admin (str), members[] (array of usernames), messages[] (array of messages) } , ... ]

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
                    // creating each group with its info
                    db.getDB().collection(groupsCollection).find({_id: db.getPrimaryKey(groupID)}).toArray((err, documents) => {
                        if (err) console.log(err);
                        else if (documents.length) {
                            const group = documents[0];
                            joinedGroup.id = group._id;
                            joinedGroup.name = group.name;
                            joinedGroup.logo = group.name + groupID;
                            joinedGroup.admin = group.admin;
                            joinedGroup.members = group.members.split(',');
                            joinedGroup.members.pop();
                            joinedGroup.size = joinedGroup.members.length;
                            joinedGroup.onlineUsers = [];
                        }
                        return resolve(joinedGroup);
                    });
                }).then(response => {
                    return JSON.parse(JSON.stringify(response));
                }).then(joinedGroup => {
                    // Getting all messages from group.id collection
                    db.getDB().collection(joinedGroup.id).find({}).toArray((err, documents) => {
                        if (err) console.log(err);
                        else if (documents.length)
                            joinedGroup.messages = documents;
                        userGroups.push(joinedGroup);
                    });
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
                    first_name: req.session.user.first_name,
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

/* GET searched groups */
router.get('/search', (req, res) => {
    const searchValue = req.query.search;
    if (searchValue === '') {
        res.json({ok: 0, n: 0});
        return;
    }
    const regex = {$regex: `^${searchValue}`, $options: 'i'};
    new Promise(resolve => {
        db.getDB().collection(groupsCollection).find({name: regex}).toArray((err, documents) => {
            if (err) console.log(err);
            else if (documents.length) {
                return resolve({
                    ok: 1,
                    n: documents.length,
                    groups: documents
                });
            } else return resolve({ok: 1, n: 0});
        });
    }).then(response => JSON.parse(JSON.stringify(response))).then(data => {
        if (data.n) {
            const foundGroups = [];
            new Promise(resolve => {
                data.groups.forEach(group => {
                    group.id = group._id;
                    group.members = group.members.split(',');
                    group.members.pop();
                    group.size = group.members.length;
                    group.onlineMembers = [];
                    db.getDB().collection(group._id).find({}).toArray((err, messages) => {
                        group.messages = messages;
                        foundGroups.push(group);
                        if (foundGroups.length === Number(data.groups.length))
                            return resolve(foundGroups);
                    });
                });
            }).then(response => JSON.parse(JSON.stringify(response))).then(foundGroups => {
                console.log(foundGroups);
                res.json({
                    user: {
                        first_name: req.session.user.first_name,
                        last_name: req.session.user.last_name,
                        username: req.session.user.username,
                        groups: foundGroups
                    }, ok: 1, n: foundGroups.length
                });
            });
        } else res.json({ok: 1, n: 0, status: 'No Group Found'});
    });
});

/* GET add group page */
router.get('/add-group', (req, res) => {
    res.render('chat/new-group');
});

/* POST request for creating a new group */
router.post('/add-group', (req, res) => {

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
                    else res.json({ok:1});
                });
        }
    });
});

// GET request for getting all members of the group
router.get('/group-members', (req, res) => {
    const membersUsernames = req.query.members.split(',');
    const members = [];
    let longestName = 0, longestUsername = 0;
    new Promise(resolve => {
        membersUsernames.forEach(username => {
            db.getDB().collection(usersCollection).find({username}).toArray((err, documents) => {
                if (err) console.log(err);

                const user = documents[0];
                const nameLength = (user.first_name + user.last_name).length;
                if (nameLength > longestName) longestName = nameLength;
                if (username.length > longestUsername) longestUsername = username.length;

                members.push({
                    name: `${user.first_name} ${user.last_name}`, username
                });
                if (members.length === membersUsernames.length) return resolve({
                    members, longestName, longestUsername
                });
            });
        });
    }).then(response => JSON.parse(JSON.stringify(response))).then(data => res.json(data));
});

// GET request for getting online members of the group
router.get('/online-members', (req, res) => {
    const groupID = req.query.groupID;
    res.json(users.getOnlineUsers(groupID));
});

// PUT request for Adding a member to group
router.put('/add-member', (req, res) => {
    // extracting username of the new member & group id
    let username = req.body.newMember;
    let groupID = req.body.groupID;

    // server side validation
    const invalidChars = "\"!#$%^&*()+{}|-=[]\\\\/\\',<>?\\\"";
    for (const char of invalidChars)
        if (username.includes(char)) {
            res.json({
                ok: 0,
                reason: `Username contains the invalid character: '${char}'`
            });
            return;
        }

    if (username.indexOf('@') > 0) {
        res.json({
            ok: 0,
            reason: 'Username contains invalid char in an invalid position'
        });
        return;
    }

    username = username[0] === '@' ? username : "@" + username;
    username = username.toLowerCase();

    new Promise((resolve, reject) => {
        db.getDB().collection(usersCollection).find({username}).toArray((err, documents) => {
            if (err) console.log(err);
            else if (documents.length) {
                const user = documents[0];
                if (user.groups.includes(groupID)) {
                    const response = {
                        ok: 0,
                        reason: `The user:  ${username} already exists in the group!`
                    };
                    return reject(response);
                }
                // updating the user
                user.groups += groupID + ',';
                db.getDB().collection(usersCollection).findOneAndUpdate({username}, {$set: {groups: user.groups}}, {returnOriginal: false}, (err, result) => {
                    if (err) console.log(err);
                });
                return resolve(user);
            } else {
                const response = {
                    ok: 0,
                    reason: 'User not found! invalid username.'
                };
                return reject(response);
            }
        });
    }).then(response => {
      return JSON.parse(JSON.stringify(response));
    }).then(user => {
        // updating the group which user is added to
        db.getDB().collection(groupsCollection).find({_id: db.getPrimaryKey(groupID)}).toArray((err, documents) => {
            if (err) console.log(err);
            else if (documents.length) {
                const group = documents[0];
                group.members += user.username + ",";
                db.getDB().collection(groupsCollection).findOneAndUpdate({_id: db.getPrimaryKey(groupID)}, {$set: {members: group.members}}, {returnOriginal: false}, (err, result) => {
                    if (err) console.log(err);
                    else res.json({
                        ok: 1,
                        first_name: user.first_name
                    });
                });
            }
        });
    }).catch(err => {
        res.json(err);
    });
});

// PUT request for leaving the group
router.put('/leave-group', (req, res) => {
    const {username, groupID} = req.body;
    new Promise(resolve => {
        // removing this group from user groups
        db.getDB().collection(usersCollection).find({username}).toArray((err, documents) => {
            if (err) console.log(err);
            const user = documents[0];
            const groups = user.groups.split(',');
            groups.splice(groups.indexOf(groupID), 1);
            user.groups = groups.join(',');
            db.getDB().collection(usersCollection).findOneAndUpdate({username}, {$set: {groups: user.groups}}, {returnOriginal: false}, (err, result) => {
                if (err) console.log(err);
            });
            resolve({ok: 1});
        });
    }).then(response => {
        return JSON.parse(JSON.stringify(response));
    }).then(response => {
        if (response.ok) {
            // removing this user from this group collection
            db.getDB().collection(groupsCollection).find({_id: db.getPrimaryKey(groupID)}).toArray((err, documents) => {
                if (err) console.log(err);
                const group = documents[0];
                const members = group.members.split(',');
                members.splice(members.indexOf(username), 1);
                group.members = members.join(',');
                // if group is empty we remove its collection from db
                if (members.length === 1) {
                    db.getDB().dropCollection(String(groupID), (err, result) => {
                        if (err) console.log(err);
                    });
                    db.getDB().collection(groupsCollection).findOneAndDelete({_id: db.getPrimaryKey(groupID)}, (err) => {
                        if (err) console.log(err);
                    });
                    res.json({ok: 1, deleted: true});
                    return;
                }
                db.getDB().collection(groupsCollection).findOneAndUpdate({_id: db.getPrimaryKey(groupID)}, {$set: {members: group.members}}, {returnOriginal: false}, (err, result) => {
                    if (err) console.log(err);
                    // Handling online users
                    const onlineUsers = users.getOnlineUsers(groupID);
                    const offlineUser = onlineUsers.find(user => user.username === username);
                    onlineUsers.splice(onlineUsers.indexOf(offlineUser), 1);
                    res.json({ok: 1, deleted: false});
                });
            });
        }
    });
});

module.exports = router;