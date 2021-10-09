const express = require('express');
const dotenv = require('dotenv');

// LOAD ENV VARS
dotenv.config({ path: './config/config.env' });

const app = express();

//bootcamps routes
const bootcamps = require('./routes/bootcamps');
app.use('/api/v1/bootcamps', bootcamps);


const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`server running in ${process.env.NODE_ENV} mode at port ${PORT}`);
});