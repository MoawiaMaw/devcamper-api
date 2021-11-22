const express = require('express');
const dotenv = require('dotenv');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const path = require('path')

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// LOAD ENV VARS
dotenv.config({ path: './config/config.env' });

// connect to database
connectDB();


const app = express();


//body parser
app.use(express.json());

//file uploading
app.use(fileupload());

//cookie parser
app.use(cookieParser());


//security middlewares
//Sanitize date (noSQL injection)
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

//Prevent XSS (cross side scripting)
app.use(xss());

// rate limit (limit number of requests)
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, //10mins
    max: 100
});

app.use(limiter);

// prevent HTTP params pollution
app.use(hpp());

//allow Cross Origin Request
app.use(cors());


// set static folder
app.use(express.static(path.join(__dirname, 'public')));


//bootcamps routes
const bootcamps = require('./routes/bootcamps');
app.use('/api/v1/bootcamps', bootcamps);

//courses routes
const courses = require('./routes/courses');
app.use('/api/v1/courses', courses);

//authentication routes
const auth = require('./routes/auth');
app.use('/api/v1/auth', auth);

//Admin routes
const users = require('./routes/admin');
app.use('/api/v1/admin/users', users);

//reviews routes
const reviews = require('./routes/reviews');
app.use('/api/v1/reviews', reviews)


//middlewares
app.use(errorHandler);


const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
    console.log(`server running in ${process.env.NODE_ENV} mode at port ${PORT}`);
});

//handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    //close server
    server.close(() => {
        process.exit(1);
    });
});