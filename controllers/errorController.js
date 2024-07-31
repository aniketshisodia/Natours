const AppError = require('../appError');

const handleJWTError = err => new AppError('Inavlid Token Please Login Again', 401);

const handleJWTExpiredWrror = () => new AppError('Your token has expired! Please Login Again');

const handleCastErrorDB = err => {
    const message = `Inavlid ${err.path} : ${err.value}`;
    return new AppError(message, 404);
}

const handleDuplicateFields = err => {
    const value = err.message.match(/(["'])(\\?.)*\1/g);
    console.log('\n' + value);
    const message = `Duplicate field value ${value}: please use different value`;
    return new AppError(message, 404);
}

const handleValidationError = err => {
    console.log('Kashish Soda is here');
    // const errors = Object.values(err.error).map(el => el.message);
    const message = `Invalid input data`;
    return new AppError(message, 400);
}

const sendErrorDev = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }
    //RENDERED WEBSITE
    else {
        res.status(err.statusCode).render('error', {
            title: 'Someting went wrong',
            msg: err.message
        });
    }
}

const sendErrorProd = (err, res) => {
    // API 's
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }
        else {
            console.error('🎃  ERROR  🎃');
            // console.log(err);
            res.status(err.statusCode).json({
                status: err.status,
                message: 'Someting went wrong',
            });
        }
    }
    //RENDERED WEBSITE
    else {
        if (err.isOperational) {
            res.status(err.statusCode).render('error', {
                title: 'Someting went wrong',
                msg: err.message
            });
        }
        else {
            console.error('🎃  ERROR  🎃');
            // console.log(err);
            res.status(err.statusCode).json({
                status: err.status,
                message: 'Someting went wrong',
            });
        }
    }
}

module.exports = ((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    console.log(process.env.NODE_ENV);

    if (process.env.NODE_ENV === 'development') {
        let error = { ...err };
        console.log(error);
        sendErrorDev(err, req, res);
    }
    else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        console.log('\n\n\n' + error._message + '\n');

        if (error._message === 'Validation failed') error = handleValidationError(error);
        if (error.name === 'CastError') error = handleCastErrorDB(err);
        if (error.code === 11000) error = handleDuplicateFields(err);
        if (error.name === 'JsonWebTokenError') error = handleJWTError(err);
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredWrror();

        sendErrorProd(error, res);
    }
});
