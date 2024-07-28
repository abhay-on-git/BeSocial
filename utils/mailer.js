const nodemailer = require("nodemailer");
require('dotenv').config()
exports.sendmail = (req, res, user) => {
    const transport = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        auth: {
            user: process.env.MAIL_ID,
            pass: process.env.MAIL_PWD,
        },
    });

    const mailOptions = {
        from: "BeSocial <abhayagnihotri1585@gmail.com>",
        to: user.email,
        subject: "Post Info",
        html: `
                <h3>Your Post has been liked by : ${user.username}</h3>
            `,
    };

    transport.sendMail(mailOptions, async (err, info) => {
        console.log('first')
        if (err) return res.send(err);

        return res.redirect(`/feed`);
    });
};
