const startTransaction = (connection) => {
    return new Promise(
        (resolve, reject) => {
            connection.beginTransaction(
                error => {
                    if (error)
                        return reject({ connection, error })
                    resolve({ connection })
                }
            )
        }
    )
}

const mkQueryFromPool = function (sql, pool) {
    const f = function (params) {
        const p = new Promise(
            (resolve, reject) => {
                pool.getConnection(
                    (err, conn) => {
                        if (err)
                            return reject(err);
                        conn.query(sql, params || [],
                            (err, result) => {
                                conn.release();
                                if (err)
                                    return reject(err);
                                resolve(result);
                            }
                        )
                    }
                )
            }
        )
        return (p);
    }
    return (f);
}

const mkQuery = function (sql) {
    return status => {
        const conn = status.connection;
        const params = status.params || [];
        console.log('in mkquery params is,', params)
        return new Promise(
            (resolve, reject) => {
                conn.query(sql, params,
                    (err, result) => {
                        if (err)
                            return reject({ connection: status.connection, error: err });
                        console.log("SQL RESULT", result)
                        resolve({ connection: status.connection, result });
                    }
                )
            }
        )
    }
}

const commit = (status) => {
    return new Promise(
        (resolve, reject) => {
            const conn = status.connection;
            console.log("went into commit block")
            conn.commit(err => {
                if (err)
                    return reject({ connection: conn, error: err });
                resolve({ connection: conn });
            })
        }
    )
}

const rollback = (status) => {
    return new Promise(
        (resolve, reject) => {
            const conn = status.connection;
            console.log("went into rollback block")
            conn.rollback(err => {
                if (err)
                    return reject({ connection: conn, error: err });
                reject({ connection: conn, error: status.error });
            })
        }
    )
}

module.exports = { startTransaction, mkQuery, commit, rollback, mkQueryFromPool };