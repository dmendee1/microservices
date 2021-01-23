const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const {dbConnection} = require('../../config/config.json');

const db = mysql.createConnection(dbConnection);

db.connect((err) => {
    if(err) {
        throw err;
    }
    console.log(`MySQL connection established...`);
})

router.post('/create', (req, res) => {
    let sql = 'INSERT INTO log SET ?';
    const log = {
        request_id: req.body.requestId,
        request_data: JSON.stringify(req.body.requestData),
        response_data: JSON.stringify(req.body.responseData)
    };

    let query = db.query(sql, log, err => {
        if(err) {
            throw err;
        }
        res.json({"code": 0, "message":"Successfully"});
    })
})

module.exports = router;