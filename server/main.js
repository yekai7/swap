const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const jwt = require('jsonwebtoken');

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
        }
    }
}
const mkQuery = require('./dbUtil');
const { loadDB, testConn } = require('./initDB');
const connection = loadDB(dbConfig);
const REGISTER_USER = 'insert into users(email, name, password) values (?, ?, sha2(?,256))';
const FIND_USER = 'select count(*) as user_count from users where email = ? and password = sha2(?, 256)';
const registerUser = mkQuery(REGISTER_USER, connection.mysql);
const findUser = mkQuery(FIND_USER, connection.mysql);
const authenticateUser = (param) => {
    return (
        findUser(param)
            .then(result => (result.length && result[0].user_count > 0))
    )
}

const passport = require('passport');
const LocalStrat = require('passport-local').Strategy;

passport.use(new LocalStrat(
    {
        usernameField: 'email',
        passwordField: 'password',
    },
    (user, pass, done) => {
        authenticateUser([user, pass])
            .then(result => {
                if (result) {
                    return (done(null, user))
                }
                done(null, false)
            })
    }
))

const PORT = parseInt(process.argv[2] || process.env.PORT) || 3000;
const app = express();
app.use(cors());
app.use(morgan('tiny'))
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize());

app.post('/login', express.json(),
    passport.authenticate('local',
        {
            session: false,
            failureRedirect: '/failedAuth'
        }
    ),
    (req, resp) => {
        console.log("req user", req.user)
        const currentTime = new Date().getTime();
        connection.mongodb.db('swapIt').collection('users')
            .find({
                email: req.user
            })
            .toArray()
            .then(result=>{
                rec = result[0];
                const token = jwt.sign({
                    sub: rec.name,
                    iss: 'swapDB',
                    iat: currentTime,
                    exp: currentTime  + (1000 * 60 * 60),
                    data: {
                        message: "can add more later"
                    }
                }, dbConfig.tokenSecret)
                resp.status(200).json({token_type: 'Bearer', access_token: token})
            })
        
    }
)

app.get('/failedAuth', (req, resp)=>{
    resp.status(401).send({message:'Invalid credentials.'})
})

app.post('/register', express.json(), (req, resp) => {
    const formData = req.body
    registerUser([formData.email, formData.name, formData.password]).then(result => {
        resp.status(200).send(result)
    }).catch(err => {
        if (err.errno == 1062)
            return resp.status(409).send({ message: 'Email already taken' })
        resp.status(400).send({ err })
    })
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