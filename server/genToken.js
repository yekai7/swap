const jwt = require('jsonwebtoken');
const dbConfig = require('./readSetDbConfig');


const token = (sub, data = null) => {
    const currentTime = new Date().getTime();
    const token = jwt.sign({
        sub: sub,
        iss: 'swapDB',
        iat: currentTime,
        //token expires after 1 day
        exp: currentTime + (864000),
        data: data
    }, dbConfig().tokenSecret)
    return token
}

module.exports = token