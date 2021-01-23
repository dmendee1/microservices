const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRouter = require('./routes/api/user');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/user', userRouter);

const port = 8081;

app.listen(port, () => {
    console.log(`User microservice app listening at http://localhost:${port}`)
});