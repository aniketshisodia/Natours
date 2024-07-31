
const { convert } = require('html-to-text');
const nodemailer = require('nodemailer');
const pug = require('pug');

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
        user: '798539001@smtp-brevo.com',
        pass: 'xsmtpsib-450b8c15502aa718c712b6f3df6184cc590cec3ffb2d1a597f684ad5a14e3acf-r5NsYPmXgv7c1E6a'
    }
})

const mailOptions = {
    from: 'shisodiaaniket@gmail.com',
    to: 'anikeet@mailsac.com',
    subject: ' hello',
    text: 'helloe'
};

transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        console.log(error);
    }
    else {
        console.log('Email Sent' + info.response);
    }
});
