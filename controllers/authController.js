const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');
const User = require('./../models/userModel');
const AppError = require('../appError');
const crypto = require('crypto');
const Email = require('./../utils/email');
// const { use } = require('../routes/userRoutes');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        // expiresIn: process.env.JWT_EXPIRES_IN
    })
}


const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production')
        cookieOptions.secure = true;


    res.cookie('jwt', token, cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token
        ,
        data: {
            user
        }
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });
    const url = `${req.protocol}://${req.get('host')}/me`;
    console.log(url);
    await new Email(newUser, url).sendWelcome();
    createSendToken(newUser, 201, res);
});


exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    // 1 - check is email and password exists
    if (!email || !password) {
        return next(new AppError('Please provide valid email and password!', 400)); 1
    }
    // 2 - check is user exists and password is correct

    const user = await User.findOne({ email }).select('+password');

    // const correct = await user.correctPassword(password , user.password);

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 10000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    });
};

exports.protect = catchAsync(async (req, res, next) => {

    // 1. Getting token and check its there
    let token;
    // console.log(req.headers);
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError('You are not logged in !', 401))
    }

    // console.log('token is' + token);

    // 2. Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log('decode string ' + decoded);

    // 3. Check if user still exists

    // console.log('decodedd id ' + decoded.iat);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('the user belonging to this token no longer exist'), 401);
    }

    // 3. if user change password after the token was issued

    // console.log(decoded + '\n');
    if (currentUser.changesPasswordAfter(decoded.iat)) {
        return next(new AppError('Use recently changed password! Please log in again.', 401));
    }
    // jwt provides iat;
    // grant access to protected route
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
})

// this req.user ->> 

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        roles.forEach(el => console.log(el + '\n'));
        console.log('roles are - ' + req.user.role + '\n\n\n');
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You don\'t have access to perform this action', 403));
        }
        next();
    }
}

exports.forgotPassword = async (req, res, next) => {
    // 1* get user based on email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with this email address', 404));
    }
    // 2* Generate the random test token
    const resetToken = user.changesPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // 3* send it to users email


    // const message = `Forgot yout password ${resetURL}`;
    try {
        // console.log(user.email);
        // await sendEmail({
        //     email: user.email,
        //     subject: `your password reset token (valid for 10 min)`,
        //     message
        // });
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/passwordReset/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();
        res.status(200).json({
            status: 'success',
            message: 'token sent to email'
        });
    }
    catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        console.log("error is : ------- ", err);
        return next(new AppError('There was an error in sending mail : Try again later!'), 500);
    };
};


exports.resetPassword = async (req, res, next) => {

    // 1. get user based on token
    try {
        const hashedToken =
            crypto
                .createHash('sha256')
                .update(req.params.token)
                .digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return next(new AppError('Token is invalid', 400));
        }
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        createSendToken(user, 200, res);

    }
    catch (err) {
        next(new AppError('Cant reset password some error(i m from authcontroller)'));
    }
};


exports.updatePassword = async (req, res, next) => {

    try {
        // 1) get user from collection
        const user = await User.findById(req.user.id).select('+password');

        // 2) check if posted password is correct
        // console.log(req.body.passwordCurrent + ' === ' + user.password);

        if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
            return next(new AppError('Wrong password Enter correct password to reset your password', 401));
        }


        // 3) if so , update password
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        await user.save();

        // 4) log user in send , jwt
        createSendToken(user, 200, res);
    }
    catch (err) {
        return next(new AppError('Cant update passWord some error ocurred'));
    }
};



// only for rendered pages
exports.isLoggedIn = catchAsync(async (req, res, next) => {
    if (req.cookies.jwt) {
        try {

            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            if (currentUser.changesPasswordAfter(decoded.iat)) {
                return next();
            }

            res.locals.user = currentUser;
            return next();
        }
        catch (err) {
            return next();

        }
        return next();
    }
    next();
})


