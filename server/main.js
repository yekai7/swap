const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');

let dbConfig;
if (fs.existsSync(__dirname, '/dbConfig.js')) {
    dbConfig = require('./dbConfig');
} else {
    dbConfig = {
        mongo: {
            url: process.env.MONGOURL
        }
    }
}
const mkQuery = require('./dbUtil');
const { loadDB, testConn } = require('./initDB');

const passport = require('passport');
const localStrat = require('passport-local').Strategy;

passport.use(new localStrat(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    (user, pass, done) => {

    }
))

const PORT = parseInt(process.argv[2] || process.env.PORT) || 3000;

const connection = loadDB(dbConfig);
const app = express();
app.use(cors());
app.use(morgan('tiny'))
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize());

app.post('/login', (req, resp) => {

})

testConn(connection).then(result => {
    console.log(result)
    app.listen(PORT, () => {
        console.log(`App started, listening on ${PORT} on ${new Date()}`)
    })
}).catch(err => {
    console.log("ERR", err)
    process.exit(-1);
})