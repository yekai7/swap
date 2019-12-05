const fs = require('fs')
const dbConfig = () => {
    let dbConfig;
    if (fs.existsSync(__dirname, '/dbConfig.js')) {
        dbConfig = require('./dbConfig');
        dbConfig.mysql.ssl = {
            ca: fs.readFileSync(dbConfig.mysql.cacert)
        }
    } else {
        dbConfig = {
            mongo: {
                url: process.env.MONGOURL
            },
            tokenSecret: process.env.TOKENSECRET
        }
    }
    return dbConfig;
}

module.exports = dbConfig;