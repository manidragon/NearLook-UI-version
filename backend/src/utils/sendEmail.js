const nodemailer = require('nodemailer');

async function sendVerificationEmail(to, subject, text, html = undefined) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"${process.env.EMAIL_USER}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html
    };

    await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail };
