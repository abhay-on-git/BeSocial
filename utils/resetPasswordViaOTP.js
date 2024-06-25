const nodemailer = require("nodemailer");

exports.resetPasswordViaOTP = async (req, res, user,ifResend) => {
    const OTP = Math.floor(1000 + Math.random() * 9000);
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
        to: ifResend ? user.email : req.body.email,
        subject: "Password Reset Link",
        html: `
                <h3>Your BeSocial Password Reset OTP</h3>
                <h2>OTP: ${OTP}</h2>
            `,
    };

    transport.sendMail(mailOptions, async (err, info) => {
        console.log('first')
        if (err) return res.send(err);
        console.log(info);

        user.otp = OTP;
        console.log(OTP)
        await user.save();

        return res.redirect(`/verify-otp/${user._id}`);
    });
};