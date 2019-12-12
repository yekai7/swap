const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { genToken, verifyToken } = require('./tokenSvc');

const dbConfig = require('./readSetDbConfig');
const mkQuery = require('./dbUtil');
const { loadDB, testConn } = require('./initDB');
const connection = loadDB(dbConfig());
const ObjectID = require('mongodb').ObjectID;


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
            const token = genToken(formData.email);
            return token
        })
        .then((token) => {
            getUserDetail([formData.email]).then(result => {
                console.log(result)
                resp.status(200).json({ token_type: 'Bearer', access_token: token, userDetail: result })
            })
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

app.get('/listings/category/:category', (req, resp) => {
    const category = req.params.category;
    const unwind = (req.query.unwind == 'true');
    const searchTerm = [{
        $match: {
            $or: [{ 'haveItem.listingSubCat': category }, { 'haveItem.category': category }]
        }
    }, { $sort: { 'listDate': -1 } }];
    if (unwind) {
        searchTerm.push({ $unwind: '$haveItem' });
        searchTerm.push({
            $match: {
                $or: [{ 'haveItem.listingSubCat': category }, { 'haveItem.category': category }]
            }
        });
    }
    connection.mongodb.db('swapIt').collection('listing')
        .aggregate(searchTerm)
        //temporailiy return 5 result only, remove after adding listing score
        .toArray()
        .then(result => {
            console.log("TEST RESULT IS", result)
            resp.status(200).send(result);
        })
        .catch(err => {
            console.log("ERR IS ", err)
            resp.status(403).send(err)
        })
})

app.get('/listings/title/:title', (req, resp) => {
    const title = req.params.title;
    connection.mongodb.db('swapIt').collection('listing')
        .aggregate([
            { $match: { 'haveItem.listingTitle': title } },
            { $unwind: '$haveItem' },
            { $match: { 'haveItem.listingTitle': title } },
            { $sort: { 'listDate': -1 } }
        ])
        .toArray()
        .then(result => {
            resp.status(200).send(result);
        })
        .catch(err => {
            resp.status(403).send(err)
        })
})

app.get('/:user/listings', (req, resp) => {
    const user = req.params.user;
    connection.mongodb.db('swapIt').collection('listing')
        .find({
            listingBy: user
        })
        .sort({
            listDate: -1
        })
        .toArray()
        .then(result => {
            if (result.length == 0)
                return resp.status(404).send({ message: 'No listing for this user' })
            const data = result.map(v => {
                date = new Date(v.listDate)
                v.listDate = date.toLocaleDateString('en-US');
                return v
            })
            resp.status(200).send(data);
        })
})

const authToken = (req, resp, next) => {
    const auth = req.get('Authorization');
    if (!auth && auth.startsWith('Bearer '))
        return resp.status(403).json({ message: "Unauthorised action." })
    const token = auth.substring('Bearer '.length)
    verifyToken(token)
        .then(result => {
            if (result)
                return next();
            resp.status(401).send({ message: "Invalid token" })
        })
        .catch(err => {
            resp.status(403).send({ message: "No token!" })
        })
}

app.delete('/listing', authToken, (req, resp) => {
    connection.mongodb.db('swapIt').collection('listing')
        .deleteOne({
            "_id": ObjectID(req.query.id)
        })
        .then(result => {
            resp.status(200).send(result)
        })
        .catch(err => {
            resp.status(400).send(err)
        })
})

app.get("/matchListing/:id", authToken, (req, resp) => {
    connection.mongodb.db('swapIt').collection('listing')
        .find({
            "_id": ObjectID(req.params.id)
        })
        .toArray()
        .then(searcher => {
            const exactMatch = searcher[0].exactMatch;
            const searcherHave = searcher[0].haveItem;
            const searcherWant = searcher[0].wantItem;
            searchTerm = {
                $and: [
                ]
            }
            if (exactMatch) {
                for (let i = 0; i < searcherWant.length; i++) {
                    const a = {
                        'haveItem.listingTitle': searcherWant[i].listingTitle
                    }
                    searchTerm.$and.push(a)
                }
            }

            for (let i = 0; i < searcherHave.length; i++) {
                const a = {
                    'wantItem.listingSubCat': searcherHave[i].listingSubCat
                }
                searchTerm.$and.push(a)
            }

            for (let i = 0; i < searcherWant.length; i++) {
                const a = {
                    'haveItem.listingSubCat': searcherWant[i].listingSubCat
                }
                searchTerm.$and.push(a)
            }
            console.log(searchTerm)

            connection.mongodb.db('swapIt').collection('listing')
                .find(searchTerm)
                .toArray()
                .then(result => {
                    resp.status(200).send(result)
                })
        })
        .catch(err => {
            resp.status(403).send(err)
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