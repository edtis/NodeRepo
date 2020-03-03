const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  host: "mail.name.com",
  port: 465,
  secure: true,
  auth: {
    user: "support@goodbookbible.com",
    pass: "GoodBook+1"
  }
});

module.exports = transporter;
