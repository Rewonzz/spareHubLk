const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

module.exports = async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGO_URI = uri;
    process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
    global.__MONGOD__ = mongod;
};
