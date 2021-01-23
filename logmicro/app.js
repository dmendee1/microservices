const express = require('express');
const bodyParser = require('body-parser');
const logRouter = require('./routes/api/log');

const app = express();
app.use(bodyParser.json());



app.use('/log', logRouter);

const port = process.env.PORT || 8082;

app.listen(port, () => {
    console.log(`Log microservice app listening at http://localhost:${port}`)
});