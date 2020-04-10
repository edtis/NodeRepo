const bcrypt = require("bcrypt");
const User = require("../models/user.model.js");
const DisableUsers = require("../models/disableUsers.model.js");
const transporter = require("../emails/email.config.js");

var rand, mailOptions, host, link, user_id, emailId;
async function confirmationMail(user, link) {
  mailOptions = {
    from: "support@GoodBookBible.com",
    to: `${user.email}`,
    subject: "Confirm Email",
    html:
      "Dear " +
      user.firstName +
      ",<br><br> Thank you for signing up at <a href='http://goodbookbible.study' target='_blank' style='text-decoration: none;'>GoodBookBible.study.</a> <br><br> To continue please confirm your account by clicking this link below or copy the link and paste it in your web browser’s address bar. <br> <a href=" +
      link +
      ">" +
      link +
      " </a> <br><br> Kindest Regards, <br><br> GoodBookBible<br>Support Services"
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      user_id = user._id;
      emailId = user.email;
      console.log("Email sent: " + info.response);
    }
  });
}

async function passwordResetMail(user, link) {
  mailOptions = {
    from: "support@GoodBookBible.com",
    to: `${user.email}`,
    subject: "Reset Password",
    html:
      "Hi " +
      user.firstName +
      ",<br><br> You have recently sent a request to reset your password. <br> Click the link below to reset your password. <br> <a href=" +
      link +
      ">" +
      link +
      " </a><br><br> If you have you have received this message in error, please ignore it or contact GoodBookBible. <br><br> Kindest Regards, <br><br> GoodBookBible<br>Support Services"
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      user_id = user._id;
      emailId = user.email;
      console.log("Email sent: " + info.response);
    }
  });
}

exports.resetPassword = (req, res) => {
  if (!req.body.email) {
    return res.status(400).send({
      status: false,
      message: "Email can not be empty"
    });
  }
  var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var token = "";
  for (var i = 16; i > 0; --i) {
    token += chars[Math.round(Math.random() * (chars.length - 1))];
  }
  rand = token;

  host = req.get("host");
  link = req.headers.origin + "/reset/password?id=" + rand;

  User.findOne({ email: req.body.email }).then(email => {
    if (email) {
      passwordResetMail(email, link);
      res.send({
        status: true,
        message: "Reset link has been sent to your email"
      });
    } else {
      res.send({
        status: false,
        message: "User with email not found!"
      });
    }
  });
};

exports.verifyResetPassword = async (req, res) => {
  if (req.protocol + "://" + req.get("host") == "http://" + host) {
    if (req.query.id == rand) {
      res.send({
        status: true,
        id: user_id,
        emailId: emailId
      });
    } else {
      res.send({
        status: false,
        message: "Bad request !"
      });
    }
  } else {
    res.send({ status: false, message: "Request is from unknown source" });
  }
};

exports.create = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      status: false,
      message: "User can not be empty"
    });
  }
  var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var token = "";
  for (var i = 16; i > 0; --i) {
    token += chars[Math.round(Math.random() * (chars.length - 1))];
  }
  rand = token;

  host = req.get("host");
  link = req.headers.origin + "/verify?id=" + rand;

  let user = new User(req.body);
  let salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  user.created = new Date();
  User.findOne({ email: user.email }).then(email => {
    if (email) {
      res.send({
        status: false,
        message: "User with email already found!"
      });
    } else {
      user
        .save()
        .then(data => {
          confirmationMail(data, link);
          res.send({
            status: true,
            message: "Confirmation Email Sent",
            data: data
          });
        })
        .catch(err => {
          res.status(500).send({
            status: false,
            message:
              err.message || "Some error occurred while creating the User."
          });
        });
    }
  });
};

exports.verify = async (req, res) => {
  if (req.protocol + "://" + req.get("host") == "http://" + host) {
    if (req.query.id == rand) {
      res.send({
        status: true,
        message: mailOptions.to + " has been Successfully verified",
        id: user_id
      });
    } else {
      res.send({
        status: false,
        message: "Bad request !"
      });
    }
  } else {
    res.send({ status: false, message: "Request is from unknown source" });
  }
};

exports.delete = (req, res) => {
  User.findByIdAndRemove(req.params.userId)
    .then(user => {
      if (!user) {
        return res.status(404).send({
          status: false,
          message: "User not found with id " + req.params.userId
        });
      }
      res.send({ status: true, message: "User deleted successfully!" });
    })
    .catch(err => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          status: false,
          message: "User not found with id " + req.params.userId
        });
      }
      return res.status(500).send({
        status: false,
        message: "Could not delete user with id " + req.params.userId
      });
    });
};

// Find a single user with a email
exports.findOne = async (req, res) => {
  let { email, password } = req.body;
  const data = {
    email: email
  };
  User.find(data)
    .then(user => {
      if (user.length === 0) {
        return res.status(404).send({
          status: false,
          message: "User not found!"
        });
      }
      bcrypt.compare(password, user[0].password).then(function(result) {
        if (result) {
          if (!user[0].confirmedEmail) {
            return res.status(200).send({
              status: false,
              message: "Please check your email to confirm your account"
            });
          }
          const highlighted = Array.isArray(user[0].highlighted);
          const bolded = Array.isArray(user[0].bolded);
          const underlined = Array.isArray(user[0].underlined);
          const italicized = Array.isArray(user[0].italicized);
          const notes = Array.isArray(user[0].notes);
          const referenceTags = Array.isArray(user[0].referenceTags);
          const favs = Array.isArray(user[0].favs);
          user[0].highlighted = highlighted ? user[0].highlighted : [];
          user[0].bolded = bolded ? user[0].bolded : [];
          user[0].underlined = underlined ? user[0].underlined : [];
          user[0].italicized = italicized ? user[0].italicized : [];
          user[0].notes = notes ? user[0].notes : [];
          user[0].referenceTags = referenceTags ? user[0].referenceTags : [];
          user[0].favs = favs ? user[0].favs : [];
          res.send({
            status: true,
            message: "Logged in success",
            data: user
          });
        } else {
          return res
            .status(400)
            .send({ status: false, message: "Password is invalid!" });
        }
      });
    })
    .catch(err => {
      return res.status(500).send({
        status: false,
        message: "Internal server error!"
      });
    });
};

exports.findOneById = (req, res) => {
  User.findById(req.params.userId)
    .then(user => {
      if (!user) {
        return res.status(404).send({
          message: "User not found with id " + req.params.userId
        });
      }
      const highlighted = Array.isArray(user.highlighted);
      const bolded = Array.isArray(user.bolded);
      const underlined = Array.isArray(user.underlined);
      const italicized = Array.isArray(user.italicized);
      const notes = Array.isArray(user.notes);
      const referenceTags = Array.isArray(user.referenceTags);
      const favs = Array.isArray(user.favs);
      user.highlighted = highlighted ? user.highlighted : [];
      user.bolded = bolded ? user.bolded : [];
      user.underlined = underlined ? user.underlined : [];
      user.italicized = italicized ? user.italicized : [];
      user.notes = notes ? user.notes : [];
      user.referenceTags = referenceTags ? user.referenceTags : [];
      user.favs = favs ? user.favs : [];
      res.send({
        status: true,
        message: "Sync success",
        data: user
      });
    })
    .catch(err => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          status: false,
          message: "User not found with id " + req.params.userId
        });
      }
      return res.status(500).send({
        status: false,
        message: "Internal server error!"
      });
    });
};

exports.findAll = (req, res) => {
  User.find()
    .then(data => {
      let confirmedEmail = [];
      for (let i = 0; i < data.length; i++) {
        if (data[i].confirmedEmail === false) {
          confirmedEmail.push({
            userID: data[i]._id,
            userEmail: data[i].email,
            signUpDate: data[i].created,
            confirmed: data[i].confirmedEmail
          });
        }
      }
      res.send({
        status: true,
        message: "Fetched all users successfully!",
        users: data,
        confirmedEmail: confirmedEmail
      });
    })
    .catch(err => {
      res.status(500).send({
        status: false,
        message: err.message || "Some error occurred while retrieving users."
      });
    });
};

exports.update = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      status: false,
      message: "User can not be empty"
    });
  }
  let body = req.body;
  if (req.body.password) {
    let salt = await bcrypt.genSalt(10);
    body.password = await bcrypt.hash(body.password, salt);
  }

  User.update(
    {
      _id: req.params.userId
    },
    {
      $set: body
    }
  )
    .then(user => {
      if (!user) {
        return res.status(404).send({
          status: false,
          message: "User not found with id " + req.params.userId
        });
      }
      res.send({
        status: true,
        message: "User updated successfully",
        user: user
      });
    })
    .catch(err => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          status: false,
          message: "User not found with id " + req.params.userId
        });
      }
      return res.status(500).send({
        status: false,
        message: "Error updating user with id " + err
      });
    });
};

exports.disableUsersUpdate = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Status can not be empty"
    });
  }

  DisableUsers.update(
    { isAdmin: true },
    {
      $set: req.body
    },
    { upsert: true }
  )
    .then(status => {
      if (!status) {
        return res.status(404).send({
          message: "Status not found! "
        });
      }
      res.send(status);
    })
    .catch(err => {
      return res.status(500).send({
        message: "Error updating with status!"
      });
    });
};

exports.usersStatus = (req, res) => {
  DisableUsers.find()
    .then(status => {
      res.send(...status);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving status."
      });
    });
};
