const jwt = require('jsonwebtoken');
const dbConfig = require('./readSetDbConfig');
const { loadDB, testConn } = require('./initDB');
const connection = loadDB(dbConfig());

testConn(connection);

const genToken = (sub, data = null) => {
    const currentTime = new Date().getTime();
    const token = jwt.sign({
        sub: sub,
        iss: 'swapDB',
        iat: currentTime,
        //token expires after 1 day
        exp: currentTime + (864000),
        data: data
    }, dbConfig().tokenSecret);
    connection.mongodb.db('swapIt').collection('tokens')
        // .createIndex({
        //     "createdAt": 1
        // }, { expireAfterSeconds: 86400 })
        // .then(result=>{
        //     console.log(result)
        // })
        .insertOne({
            token: token,
            createdAt: new Date()
        })
        .then(result => {

        })
    return token
}

const verifyToken = (token) => {
    const a = new Promise((resolve, reject) => {
        connection.mongodb.db('swapIt').collection('tokens')
            .find({
                token: token
            })
            .toArray()
            .then(result => {
                if (result.length) {
                    return resolve(true)
                }
                try {
                    token = jwt.verify(token, dbConfig.tokenSecret);
                    connection.db('swapIt').collection('tokens')
                        .insertOne({
                            token: token,
                            createdAt: new Date()
                        })
                        .then(result => {
                            return resolve(true);
                        })
                        .catch(err => {
                            return reject(false);
                        })
                } catch (e) {
                    return reject(false);
                }
            })
    })
    return a
}

module.exports = { genToken, verifyToken }