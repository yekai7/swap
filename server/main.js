const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const genToken = require('./genToken');
const dbConfig = require('./readSetDbConfig');

const mkQuery = require('./dbUtil');
const { loadDB, testConn } = require('./initDB');
const connection = loadDB(dbConfig());
const REGISTER_USER = 'insert into users(email, name, password, avatar) values (?, ?, sha2(?,256), ?)';
const FIND_USER = 'select count(*) as user_count from users where email = ? and password = sha2(?, 256)';
const GET_USER_DETAIL = 'select email, name, avatar, date_joined from users where email = ?';
const registerUser = mkQuery(REGISTER_USER, connection.mysql);
const findUser = mkQuery(FIND_USER, connection.mysql);
const getUserDetail = mkQuery(GET_USER_DETAIL, connection.mysql);
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
    passport.authenticate('local', { session: false, failureRedirect: '/failedAuth' }),
    (req, resp) => {
        const token = genToken(req.user);
        getUserDetail([req.user]).then(result => {
            resp.status(200).json({ token_type: 'Bearer', access_token: token, userDetail: result })
        })
    }
)

app.get('/failedAuth', (req, resp) => {
    resp.status(401).send({ message: 'Invalid credentials.' })
})

app.post('/register', express.json(), (req, resp) => {
    const formData = req.body
    const avatar = `https://avatars.dicebear.com/v2/avataaars/${formData.name}.svg`
    registerUser([formData.email, formData.name, formData.password, avatar])
        .then(result => {
            const token = genToken(req.user);
            resp.status(201).send({ token_type: 'Bearer', access_token: token, userDetail: result })
        }).catch(err => {
            if (err.errno == 1062)
                return resp.status(409).send({ message: 'Email already taken' })
            resp.status(400).send({ err })
        })
})

app.get('/categories', (req, resp) => {
    connection.mongodb.db('swapIt').collection('categories')
        .find({})
        .toArray()
        .then(result => {
            console.log(result)
            if (result)
                return resp.status(200).send(result)
            resp.status(400).send({ message: "No category found." })
        })
})

app.post('/listing', express.json(), (req, resp) => {
    connection.mongodb.db('swapIt').collection('listing')
        .insertOne(req.body)
        .then(() => {
            console.log("REQ BODY", req.body)
            resp.status(200).send(req.body)
        })
})

app.get('/listings/:category', (req, resp) => {
    const category = req.params.category;
    console.log("category is", category);
    connection.mongodb.db('swapIt').collection('listing')
        .aggregate([
            {
                $match: {
                    "haveItem.category": category
                }
            }
        ])
        .toArray()
        .then(result=>{
            console.log("search result is ",result)
            resp.status(200).send(result);
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