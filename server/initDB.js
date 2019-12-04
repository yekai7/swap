const MongoClient = require('mongodb').MongoClient;
const mysql = require('mysql');
const aws = require('aws-sdk');

const loadDB = config => {
    return {
        mongodb: new MongoClient(config.mongo.url, { useUnifiedTopology: true }),
        mysql: mysql.createPool(config.mysql),
        s3: new aws.S3({
            endpoint: new aws.Endpoint(config.s3.endpoint_url),
            accessKeyId: config.s3.accessKey,
            secretAccessKey: config.s3.secret
        })
    }
}


const testConn = conns => {
    p1 = new Promise((resolve, reject) => {
        conns.mongodb.connect(err => {
            if (err)
                return reject(err)
            resolve("MONGO OK");
        })
    })

    p2 = new Promise((resolve, reject) => {
        conns.mysql.getConnection((err, conn) => {
            if (err)
                return reject(err)
            conn.ping(err => {
                if (err)
                    return reject(err)
                resolve("MYSQL OK");
            })
        })
    })

    p3 = new Promise((resolve, reject) => {
        const params = {
            Bucket: 'yekai',
            Key: 'seach.png'
        }
        conns.s3.getObject(params, (err, result) => {
            if (err)
                return reject(err)
            resolve("S3 OK")
        })
    })

    return (Promise.all([p1, p2, p3]))
}

module.exports = { loadDB, testConn }