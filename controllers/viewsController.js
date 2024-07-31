const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../appError');

exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
    next();
});


exports.getTour = catchAsync(async (req, res, next) => {
    // 1) Get the data, for the requested tour (including reviews and guides)
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
    }

    // 2) Build template
    // 3) Render template using data from 1)
    res.status(200).render('tour', {
        title: `${tour.name}Tour`,
        tour
    });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
    res.status(200).render('login', {
        title: 'Login into your account'
    });
});



exports.getAccount = async (req, res) => {
    console.log('get account');
    res.status(200).render('account', {
        title: 'Your account'
    });
}

exports.updateUser = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            name: req.body.name,
            email: req.body.email
        },
        {
            new: true,
            runValidators: true
        }
    );
    console.log('updated user is : ' + updatedUser);
    res.status(200).render('account', {
        title: 'Your account',
        user: updatedUser // otherwise user will come from protect middleware , req.locals.user
    });
});

exports.getBookingReply = catchAsync(async (req, res, next) => {
    res.status(200).render('booking', {
        title: 'Your booking details'
    })
})