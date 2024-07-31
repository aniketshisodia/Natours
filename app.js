const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss-clean');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingsRouter = require('./routes/bookingRoutes');
const cookieParser = require('cookie-parser')
// Start your app
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/views'));


app.use(express.urlencoded({ extended: true })); // Parses URL-encoded payloads and populates req.body with the parsed data.
app.use(express.static(`${__dirname}/public`)); // Serves static files from the 'public' directory.




// security https headears
app.use(helmet({contentSecurityPolicy: false})); 

// middle ware function
// 1. MIDDLE WARES
// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
    app.use((morgan('dev')));
}

//*************** */
const limiter = rateLimit({
    max: 100,
    window: 60 * 60 * 1000,
    message: 'too many request from this ip , please try again later(1hr)'
});

app.use('/api', limiter);


//*/****************** */
app.use(morgan('dev')); // Logs HTTP requests in the 'dev' format to the console.
app.use(express.json({ limit: '10kb' })); // Parses incoming JSON payloads and populates req.body with the parsed data.
app.use(express.urlencoded({extended: true , limit: '10kb'})) // used to parse data coming from url like form
app.use(cookieParser());

// Data sanitization against Nosql Injection
app.use(mongoSanitize());
app.use(xss());
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuality',
        'ratingsAverage',
        'difficulty',
        'maxGroupSize',
        'price'
    ]
}));

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.requestTime);
    console.log(req.cookies);
    next();
})




/*************************************************************************************/

// 3) ROUTES

app.use('/' , viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingsRouter);


/********************\*****************************************************************/

// used to mount middleware functions to a specific path

// if url is wrong
app.all('*', (req, res, next) => {
    // res.status(404).json({
        //     status: 'fail',
        //     message: `Cant find ${req.originalUrl}`
        // });
        // const err = new Error(`Cant find ${req.originalUrl}`);
        // err.status = 'fail';
        // err.statusCode = 404;
        next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
    });
    
    app.use(globalErrorHandler);
    
    
    // 4) START SERVER
    module.exports = app;
    
    
    
    
    
    
    
    
    
    
    

    // we can create our own middle ware function
    
    
    // app.use((req, res, next) => {
    //     console.log("Hello from middle ware 😎😎😎")
    //     next();
    // });
    
    
    
    
    
    
    
    
    // app.get('/api/v1/tours', getAllTours);
    // app.get('/api/v1/tours/:id', getTour);
    // app.patch('/api/v1/tours/:id', updateTour)
    // app.delete('/api/v1/tours/:id', deleteTour);
// app.post('/api/v1/tours', createTour);