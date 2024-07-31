// xsmtpsib-450b8c15502aa718c712b6f3df6184cc590cec3ffb2d1a597f684ad5a14e3acf-sfXZdGDcJhEH20AK
// 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
// brevo api key
const { convert } = require('html-to-text');
const nodemailer = require('nodemailer');
const pug = require('pug');

// new Email(user, url).sendWelcome();

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Aniket Shisodia <${process.env.EMAIL_FROM}>`;
    }
    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            return nodemailer.createTransport({
                host: "smtp-relay.brevo.com",
                port: 587,
                auth: {
                    user: '798539001@smtp-brevo.com',
                    pass: 'xsmtpsib-450b8c15502aa718c712b6f3df6184cc590cec3ffb2d1a597f684ad5a14e3acf-r5NsYPmXgv7c1E6a'
                }
            });
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }
    // send the actual email
    async send(template, subject) {
        // 1. render html base on a pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        // 2. define email options
        const mailOptions = {
            from: 'aniketshisodia7@gmail.com',
            to: 'anikeet@mailsac.com',
            subject,
            html,
            text: convert(html)
        };
        // console.log('Mail options defined:', mailOptions);
        // 3. create transport and send email
        await this.newTransport().sendMail(mailOptions);
    }
    async sendWelcome() {
        await this.send('welcome', 'Welcome to the natoursm family');
    }
    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset token(valid for only 10 minutes)');
    }
};
