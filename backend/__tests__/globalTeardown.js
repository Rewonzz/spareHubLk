module.exports = async () => {
    const mongod = global.__MONGOD__;
    if (mongod) {
        await mongod.stop();
    }
};
