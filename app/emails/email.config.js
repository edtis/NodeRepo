const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "goodbookbible@gmail.com",
    pass: "Test@123"
  }
});

module.exports = transporter;
