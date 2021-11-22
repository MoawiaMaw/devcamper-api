const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    //log for dev
    console.log(err.stack);

    //mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resourse not found`;
        error = new ErrorResponse(message, 404);
    }

    //mongoose duplicate key
    if (err.code === 11000) {
        const message = `Resourse already exists`;
        error = new ErrorResponse(message, 400);
    }

    //mongoose validation errors
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'server error'
    });
};

module.exports = errorHandler;