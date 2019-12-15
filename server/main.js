
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { genToken, verifyToken } = require('./tokenSvc');

const dbConfig = require('./readSetDbConfig');
const { mkQuery, mkQueryFromPool, commit, rollback, startTransaction } = require('./dbUtil');
const { loadDB, testConn } = require('./initDB');
const connection = loadDB(dbConfig());
const ObjectID = require('mongodb').ObjectID;
const fileUpload = multer({ dest: __dirname + '/tmp' });

const REGISTER_USER = 'insert into users(email, name, password, avatar) values (?, ?, sha2(?,256), ?)';
const FIND_USER = 'select count(*) as user_count from users where email = ? and password = sha2(?, 256)';
const GET_USER_DETAIL = 'select email, name, avatar, date_joined from users where email = ?';
const UPDATE_USER_NAME = 'update users set name = ? where email = ?';
const UPDATE_USER_AVATAR = 'update users set avatar = ? where email = ?';
const registerUser = mkQueryFromPool(REGISTER_USER, connection.mysql)
const findUser = mkQueryFromPool(FIND_USER, connection.mysql)
const getUserDetail = mkQueryFromPool(GET_USER_DETAIL, connection.mysql)
const updateUserName = mkQueryFromPool(UPDATE_USER_NAME, connection.mysql)
const updateUserAvatar = mkQuery(UPDATE_USER_AVATAR, connection.mysql)

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

const authToken = (req, resp, next) => {
    const auth = req.get('Authorization');
    if (!auth)
        // if (!auth && auth.startsWith('Bearer '))
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
                .catch(err => {
                    console.log(err)
                })
        }).catch(err => {
            if (err.errno == 1062)
                return resp.status(409).send({ message: 'Email already taken' })
            resp.status(400).send({ err })
        })
})

app.put('/user', authToken, (req, resp) => {
    const name = req.body.name;
    const email = req.body.email
    updateUserName([name, email])
        .then(result => {
            resp.status(200).send({ name: name });
        }).catch(err => {
            resp.status(400).send({ message: "err" });
        })
})

app.post('/user/avatar', authToken, express.json(), fileUpload.single('avatar'), (req, resp) => {
    const user = req.body.email
    if (req.file) {
        fs.readFile(req.file.path, (err, imgFile) => {
            const s3params = {
                Bucket: 'swap',
                Key: `avatars/${req.file.filename}`,
                Body: imgFile,
                ACL: 'public-read',
                ContentType: req.file.mimetype
            }
            connection.mysql.getConnection((err, conn) => {
                startTransaction(conn)
                    .then(status => {
                        connection.s3.putObject(s3params, (err, result) => {
                            if (err)
                                return rollback;
                            fs.unlink(req.file.path, () => {
                            })
                        })
                        return ({
                            connection: status.connection,
                            avatarUrl: `https://swap.sgp1.digitaloceanspaces.com/avatars/${req.file.filename}`
                        })
                    })
                    .then(status => {
                        const params = [status.avatarUrl, user]
                        return (
                            updateUserAvatar({
                                connection: status.connection,
                                params: params
                            })
                        )
                    })
                    .then(commit, rollback)
                    .then(
                        (status) => {
                            getUserDetail([user]).then(result => {
                                console.log([{ ...result[0] }])
                                resp.status(201).send(result);
                            })
                        },
                        (status) => { resp.status(400).json({ error: status.error }); }
                    )
                    .finally(() => { console.log("final block"); conn.release() })
            })
        })
    }
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
            const data = result.map(v => {
                date = new Date(v.listDate)
                v.listDate = date.toLocaleDateString('en-US');
                return v
            })
            resp.status(200).send(data);
        })
})

app.get('/categories', (req, resp) => {
    connection.mongodb.db('swapIt').collection('categories')
        .find({})
        .toArray()
        .then(result => {
            if (result) {
                return resp.format({
                    'text/plain': () => {
                        resp.status(200).type('application/json').send(JSON.stringify(result))
                    },
                    'application/json': () => {
                        resp.status(200).type('application/json').send(result)
                    },
                    'default': () => {
                        resp.status(406).send('Not Acceptable')
                    }
                })
            }
            resp.status(400).send({ message: "No result" })
        })
        .catch(err => {
            resp.status(400).send(err)
        })
})

app.post('/listing', authToken, fileUpload.array('listingImages', 10), (req, resp) => {
    const images = req.files
    let listing = JSON.parse(req.body.listing)
    const imagesUrl = [];
    const promises = []
    for (let i = 0; i < images.length; i++) {
        let a = new Promise((resolve, reject) => {
            fs.readFile(images[i].path, (err, imgFile) => {
                if (err)
                    return reject(err);
                const s3params = {
                    Bucket: 'swap',
                    Key: `listing/${images[i].filename}`,
                    Body: imgFile,
                    ACL: 'public-read',
                    ContentType: images[i].mimetype
                }
                connection.s3.putObject(s3params, (err, result) => {
                    if (err)
                        return reject(err);
                    fs.unlink(images[i].path, () => {
                        const imgObj = {
                            image: `https://swap.sgp1.digitaloceanspaces.com/listing/${images[i].filename}`,
                            thumbImage: `https://swap.sgp1.digitaloceanspaces.com/listing/${images[i].filename}`
                        }
                        resolve(imagesUrl.push(imgObj));
                    })
                })
            })
        })
        promises.push(a)
    }
    Promise.all(promises).then(result => {
        listing.listingImages = imagesUrl
        connection.mongodb.db('swapIt').collection('listing')
            .insertOne(listing)
            .then(() => {
                resp.status(200).send(listing)
            })
            .catch(err => {
                resp.status(400).send({ message: err })
            })
    })

})

app.get('/listing/featured', (req, resp)=>{
    connection.mongodb.db('swapIt').collection('listing')
        .find({
            'featured':true
        })
        .sort({'listingDate':-1})
        .toArray()
        .then(result=>{
            resp.status(200).send(result)
        })
        .catch(err=>{
            resp.status(400).send(err)
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

    //for searching, only displaying nested array that matches
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
        .toArray()
        .then(result => {
            resp.status(200).send(result);
        })
        .catch(err => {
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

app.get('/listing', (req, resp) => {
    connection.mongodb.db('swapIt').collection('listing')
        .find({
            "_id": ObjectID(req.query.id)
        })
        .toArray()
        .then(result => {
            resp.format({
                'text/plain': () => {
                    resp.status(200).send(JSON.stringify(result))
                },
                'text/plain': () => {
                    resp.status(200).send(`<p>${result}<p>`)
                },
                'application/json': () => {
                    resp.send(result)
                },
                'default': () => {
                    resp.status(406).send('Not Acceptable')
                }
            })
        })
        .catch(err => {
            resp.status(400).send({ message: err })
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
                    resp.status(200).send({ result, searcher })
                })
        })
        .catch(err => {
            resp.status(403).send(err)
        })
})



app.use(express.static(path.join(__dirname, 'public/dist/client')));
testConn(connection).then(result => {
    // console.log(result)
    app.listen(PORT, () => {
        console.log(`App started, listening on ${PORT} on ${new Date()}`)
    })
}).catch(err => {
    console.log("ERR", err)
    process.exit(-1);
})