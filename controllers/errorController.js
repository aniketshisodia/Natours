const AppError = require('../appError');

const handleJWTError = () => new AppError('Invalid Token. Please Login Again', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please Login Again', 401);

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path} : ${err.value}`;
    return new AppError(message, 400); // Changed to 400 for invalid input
};

const handleDuplicateFields = err => {
    const value = err.message.match(/(["'])(\\?.)*\1/g);
    const message = `Duplicate field value ${value}: please use a different value`;
    return new AppError(message, 400); // Changed to 400 for bad request
};

const handleValidationError = err => {
    const message = `Invalid input data`;
    return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
    if (res.headersSent) return; // Avoid sending headers if already sent

    if (req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message
        });
    }
};

const sendErrorProd = (err, req, res) => {
    if (res.headersSent) return; // Avoid sending headers if already sent

    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        } else {
            console.error('🎃  ERROR  🎃');
            res.status(500).json({
                status: 'error',
                message: 'Something went wrong',
            });
        }
    } else {
        if (err.isOperational) {
            res.status(err.statusCode).render('error', {
                title: 'Something went wrong',
                msg: err.message
            });
        } else {
            console.error('🎃  ERROR  🎃');
            res.status(500).render('error', {
                title: 'Something went wrong',
                msg: 'Please try again later.'
            });
        }
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };

        if (error._message === 'Validation failed') error = handleValidationError(error);
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFields(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, req, res);
    }
};
