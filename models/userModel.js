const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { type } = require('os');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell your name']
    },
    email: {
        type: String,
        required: [true, 'Your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid e-mail']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minLength: 6,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'please confirm your password'],
        validate: {
            // this only works on save;
            validator: function (el) {
                return el === this.password;
            }
        }
    },
    passwordChangedAt: {
        type: Date
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})


// runs b/w getting and saving data to databases

// userSchema.pre('save', async function (next) {
//     // only run this function if passwrod is modified 
//     if (!this.isModified('password')) {
//         return next();
//     }
//     // Hash the password with cost 12
//     this.password = await bcrypt.hash(this.password, 12);
//     this.passwordConfirm = undefined;
// })


userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changesPasswordAfter = function (JWTTimestamp) {
    // console.log('hello password changed at \n \n');
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        console.log(changedTimeStamp + '    ', JWTTimestamp);
        return JWTTimestamp < changedTimeStamp; // 
    }
    return false;
    // not changed
};

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.methods.changesPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    // console.log({ resetToken }, this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
}

//we use query middleware
userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});


const User = mongoose.model('User', userSchema);

module.exports = User;

