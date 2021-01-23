const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const redis = require('redis');

const config = require('../../config/config.json');

const validateLoginInput = require('../../validation/login');
const validateRegisterInput = require('../../validation/register');

const db = mysql.createConnection(config.dbConnection);
const redisClient = redis.createClient();


db.connect((err) => {
    if(err) {
        throw err;
    }
    console.log(`MySQL connected`);
})

promiseGetRedis = (key) => {
    return new Promise(function(resolve, reject) {
        redisClient.get(key, function(err, data) {
            if(data === undefined || data === null) {
                reject("Redis ${key} is null or undenfied");
            } else {
                resolve(data);
            }
        })
    })
}

function setRedis(key, value, expiredSecond) {
    redisClient.set(key, value, 'EX', expiredSecond);
}

function getRedis(key) {
    redisClient.get(key, function(err, data) {
        return data;
    })
}

router.get('/list', (req, res) => {
    let sql = "SELECT * FROM user";
    promiseGetRedis("userlist").then(result => {
        console.log("select from cache. ");
        res.json(result);
    }).catch(err => {
        console.log("err: ", err);  
        db.query(sql, function(errors, users) {
            console.log("select from db.");
            setRedis("userlist", JSON.stringify(users), 10);
            data = JSON.stringify(users);
            res.json(data);
        })
    });
})

router.get('/cache', (req, res) => {
    res.json({"userList":[{"firstname": "abc"}]});
})

router.post('/login', (req, res) => {
    console.log("/login started");
    console.log("req: ", req);
    const {errors, isValid} = validateLoginInput(req.body);

    console.log("/login started1");
    if(!isValid) {
        console.log("/login started 404");
        return res.status(400).json(errors);
    }

    const username = req.body.username;
    const password = req.body.password;

    let sql = "SELECT * FROM user WHERE username = ? LIMIT 1";

    let query = db.query(sql, username, function(err, user) {
        if(err) throw err;
        if(user.length === 0) {
            errors.message = "Username or password not matched";
            
            return res.status(404).json(errors);
        }
        user = user[0];
        
        console.log(user);

        bcrypt.compare(password, user.password)
            .then(isMatch => {
                if(isMatch) {
                    const payload = {
                        id: user.id,
                        lastname: user.lastname,
                        firstname: user.firstname,
                    }
                    jwt.sign(payload, 'secret', {
                        expiresIn: 3600
                    }, (err, token) => {
                        if(err) console.error('There is some error in token', err);
                        else {  
                            console.log("Login success");

                            res.json({
                                success: true,
                                token: `Bearer ${token}`
                            });
                        }
                    })
                } else {
                    errors.message = "Username or password not matched"
                    return res.status(404).json(errors);
                }
            })
        
    })
});

router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    console.log("req.body", req.body);
    const newUser = {
        lastname : req.body.lastname,
        firstname : req.body.firstname,
        username : req.body.username,
        password : req.body.password,
        create_date: new Date()
    };
    
    bcrypt.genSalt(config.salt, (err, salt) => {
        if(err) console.error('There was an error', err);
        else {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if(err) console.error('There was an error', err);
                else {
                    newUser.password = hash;
                    let sql = 'INSERT INTO user SET ?';
                    let query = db.query(sql, newUser, err => {
                        if(err) {
                            throw err;
                        }
                        newUser.password = "#######";
                        res.json({user: newUser});
                    })
                }
            });
        }
    });
});

module.exports = router;