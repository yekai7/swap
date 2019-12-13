const fs = require('fs')
const dbConfig = () => {
    let dbConfig;
    try {
        if (fs.existsSync(__dirname, './dbConfig.js')) {
            dbConfig = require('./dbConfig');
        }
    } catch (e) {
        console.log("it went here")
        dbConfig = {
            mongo: {
                url: process.env.MONGOURL
            },
            s3: {
                accessKey: process.env.S3PUBLIC,
                secret: process.env.S3SECRET,
                endpoint_url: process.env.S3ENDPOINT
            },
            mysql: {
                host: process.env.SQLHOST, port: 25060,
                user: process.env.SQLUSER, password: process.env.SQLPWD,
                database: 'swapit', connectionLimit: 4,
                cacert: process.env.SQLCERT
            },
            tokenSecret: process.env.TOKENSECRET
        }
    }
    return dbConfig;
}

module.exports = dbConfig;