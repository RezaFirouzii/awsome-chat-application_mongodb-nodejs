const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const url = 'mongodb://localhost:27017';
const dbName = 'mongodb';
const mongoOptions = { useNewUrlParser: true, useUnifiedTopology: true };

const state = {
    db: null
};

const connect = (callback) => {
    if (state.db) callback();
    else {
        MongoClient.connect(url, mongoOptions, (err, client) => {
            if (err) callback(err);
            else {
                state.db = client.db(dbName);
                callback();
            }
        });
    }
}

const getPrimaryKey = (_id) => {
    return ObjectID(_id);
}

const getDB = () => {
    return state.db;
}

module.exports = {
    connect,
    getPrimaryKey,
    getDB
};