const bcrypt = require("bcrypt");
const User = require("../models/user.model.js");
const transporter = require("../emails/email.config.js");

var rand, mailOptions, host, link, user_id, emailId;
var verificationCode = "tbtxzt738";
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
        message: "Sent you mail on your registered email"
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
  if (req.body.verificationCode !== verificationCode) {
    res.status(500).send({
      auth: false,
      error: true,
      message: "Access denied"
    });
  }
  if (req.body.register === true) {
    if (!req.body) {
      return res.status(400).send({
        auth: false,
        error: true,
        message: "User can not be empty"
      });
    }
    var chars =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var token = "";
    for (var i = 16; i > 0; --i) {
      token += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    rand = token;

    host = req.get("host");
    link = req.headers.origin + "/verify?id=" + rand;
    req.body.email = req.body.username;
    delete req.body["username"];
    let user = new User(req.body);
    let salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user.created = new Date();
    User.findOne({ email: user.email }).then(email => {
      if (email) {
        res.send({
          auth: false,
          error: true,
          message: "User already exist"
        });
      } else {
        user
          .save()
          .then(data => {
            confirmationMail(data, link);
            res.send({
              userRegistered: true,
              error: false,
              message: "Confirmation email Sent.Please check your email."
            });
          })
          .catch(err => {
            res.status(500).send({
              auth: false,
              error: true,
              message: "User not registered"
            });
          });
      }
    });
  } else {
    res.send({
      auth: false,
      error: true,
      message: "User not registered"
    });
  }
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

// Find a single user with a email
exports.findOne = async (req, res) => {
  let { username, password, login } = req.body;
  if (login === true) {
    const data = {
      email: username
    };
    User.find(data)
      .then(user => {
        if (user.length === 0) {
          return res.status(404).send({
            auth: false,
            error: true,
            message: "Username/ password incorrect"
          });
        }
        bcrypt.compare(password, user[0].password).then(function(result) {
          if (result) {
            const highlighted = Array.isArray(user[0].highlighted);
            const bolded = Array.isArray(user[0].bolded);
            const underlined = Array.isArray(user[0].underlined);
            const italicized = Array.isArray(user[0].italicized);
            const notes = Array.isArray(user[0].notes);
            const referenceTags = Array.isArray(user[0].referenceTags);
            const favs = Array.isArray(user[0].favs);
            res.send({
              auth: user[0].confirmedEmail,
              error: false,
              message: "Logged in successfully",
              databaseID: user[0]._id,
              hightlight: highlighted ? user[0].highlighted : [],
              bold: bolded ? user[0].bolded : [],
              underline: underlined ? user[0].underlined : [],
              Italic: italicized ? user[0].italicized : [],
              notes: notes ? user[0].notes : [],
              referenceTags: referenceTags ? user[0].referenceTags : [],
              favorite: favs ? user[0].favs : []
            });
          } else {
            return res.status(400).send({
              auth: false,
              error: true,
              message: "Username/ password incorrect"
            });
          }
        });
      })
      .catch(err => {
        return res.status(500).send({
          auth: false,
          error: true,
          message: "Internal server error!"
        });
      });
  } else {
    res.send({
      auth: false,
      error: true,
      message: "Username/ password incorrect"
    });
  }
};

// Find a single user with a email
exports.all = async (req, res) => {
  let { username, databaseID, all } = req.body;
  if (all === true) {
    const data = {
      email: username,
      _id: databaseID
    };
    User.find(data)
      .then(user => {
        if (user.length === 0) {
          return res.status(404).send({
            all: false,
            error: true,
            message: "Cannot retrieve data"
          });
        } else {
          const highlighted = Array.isArray(user[0].highlighted);
          const bolded = Array.isArray(user[0].bolded);
          const underlined = Array.isArray(user[0].underlined);
          const italicized = Array.isArray(user[0].italicized);
          const notes = Array.isArray(user[0].notes);
          const referenceTags = Array.isArray(user[0].referenceTags);
          const favs = Array.isArray(user[0].favs);
          res.send({
            auth: user[0].confirmedEmail,
            error: false,
            message: "Retrieve data successfully",
            databaseID: user[0]._id,
            hightlight: highlighted ? user[0].highlighted : [],
            bold: bolded ? user[0].bolded : [],
            underline: underlined ? user[0].underlined : [],
            Italic: italicized ? user[0].italicized : [],
            notes: notes ? user[0].notes : [],
            referenceTags: referenceTags ? user[0].referenceTags : [],
            favorite: favs ? user[0].favs : []
          });
        }
      })
      .catch(err => {
        return res.status(500).send({
          all: false,
          error: true,
          message: "Cannot retrieve data"
        });
      });
  } else {
    res.send({
      all: false,
      error: true,
      message: "Cannot retrieve data"
    });
  }
};

exports.highlight = async (req, res) => {
  let { highlight, username, databaseID, highlighted } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      highlight: false,
      error: true,
      message: "Highlight can not be empty"
    });
  }
  if (highlight === true && highlighted) {
    const data = {
      email: username,
      _id: databaseID
    };
    User.update(
      data,
      {
        $set: { highlighted: highlighted }
      },
      { upsert: true }
    )
      .then(user => {
        if (user.nModified) {
          res.send({
            highlight: true
          });
        } else {
          res.send({
            highlight: false,
            error: true,
            message: "Verse already highlighted"
          });
        }
      })
      .catch(err => {
        return res.status(500).send({
          highlight: false,
          error: true,
          message: "Verse not highlighted"
        });
      });
  } else {
    res.send({
      highlight: false,
      error: true,
      message: "Verse not highlighted"
    });
  }
};

exports.bold = async (req, res) => {
  let { bold, username, databaseID, bolded } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      bold: false,
      error: true,
      message: "Bolded can not be empty"
    });
  }
  if (bold === true && bolded) {
    const data = {
      email: username,
      _id: databaseID
    };
    User.update(
      data,
      {
        $set: { bolded: bolded }
      },
      { upsert: true }
    )
      .then(user => {
        if (user.nModified) {
          res.send({
            bold: true
          });
        } else {
          res.send({
            bold: false,
            error: true,
            message: "Verse already bolded"
          });
        }
      })
      .catch(err => {
        return res.status(500).send({
          bold: false,
          error: true,
          message: "Verse not bolded"
        });
      });
  } else {
    res.send({
      bold: false,
      error: true,
      message: "Verse not bolded"
    });
  }
};

exports.underline = async (req, res) => {
  let { underline, username, databaseID, underlined } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      underlined: false,
      error: true,
      message: "Underlined can not be empty"
    });
  }
  if (underline === true && underlined) {
    const data = {
      email: username,
      _id: databaseID
    };
    User.update(
      data,
      {
        $set: { underlined: underlined }
      },
      { upsert: true }
    )
      .then(user => {
        if (user.nModified) {
          res.send({
            underlined: true
          });
        } else {
          res.send({
            underlined: false,
            error: true,
            message: "Verse already underlined"
          });
        }
      })
      .catch(err => {
        return res.status(500).send({
          underlined: false,
          error: true,
          message: "Verse not underlined"
        });
      });
  } else {
    res.send({
      underlined: false,
      error: true,
      message: "Verse not underlined"
    });
  }
};

exports.referencetags = async (req, res) => {
  let { referenceTag, username, databaseID, referenceTags } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      referenceTags: false,
      error: true,
      message: "ReferenceTags can not be empty"
    });
  }
  if (referenceTag === true && referenceTags) {
    const data = {
      email: username,
      _id: databaseID
    };
    User.update(
      data,
      {
        $set: { referenceTags: referenceTags }
      },
      { upsert: true }
    )
      .then(user => {
        if (user.nModified) {
          res.send({
            referenceTags: true
          });
        } else {
          res.send({
            referenceTags: false,
            error: true,
            message: "Reference Tag already applied"
          });
        }
      })
      .catch(err => {
        return res.status(500).send({
          referenceTags: false,
          error: true,
          message: "Reference Tag not applied"
        });
      });
  } else {
    res.send({
      referenceTags: false,
      error: true,
      message: "Reference Tag not applied"
    });
  }
};

exports.italic = async (req, res) => {
  let { italic, username, databaseID, italicized } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      italic: false,
      error: true,
      message: "Italic can not be empty"
    });
  }
  if (italic === true && italicized) {
    const data = {
      email: username,
      _id: databaseID
    };
    User.update(
      data,
      {
        $set: { italicized: italicized }
      },
      { upsert: true }
    )
      .then(user => {
        if (user.nModified) {
          res.send({
            italic: true
          });
        } else {
          res.send({
            italic: false,
            error: true,
            message: "Verse already italic"
          });
        }
      })
      .catch(err => {
        return res.status(500).send({
          italic: false,
          error: true,
          message: "Verse not italic"
        });
      });
  } else {
    res.send({
      italic: false,
      error: true,
      message: "Verse not italic"
    });
  }
};

exports.favorite = async (req, res) => {
  let { favorite, username, databaseID, favs } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      favorite: false,
      error: true,
      message: "Favorite can not be empty"
    });
  }
  if (favorite === true && favs) {
    const data = {
      email: username,
      _id: databaseID
    };
    User.update(
      data,
      {
        $set: { favs: favs }
      },
      { upsert: true }
    )
      .then(user => {
        if (user.nModified) {
          res.send({
            favorite: true
          });
        } else {
          res.send({
            favorite: false,
            error: true,
            message: "Verse already favorited"
          });
        }
      })
      .catch(err => {
        return res.status(500).send({
          favorite: false,
          error: true,
          message: "Verse not favorite"
        });
      });
  } else {
    res.send({
      favorite: false,
      error: true,
      message: "Verse not favorite"
    });
  }
};

exports.notes = async (req, res) => {
  let { note, username, databaseID, notes } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      note: false,
      error: true,
      message: "Note can not be empty"
    });
  }
  if (note === true && notes) {
    const data = {
      email: username,
      _id: databaseID
    };
    User.update(
      data,
      {
        $set: { notes: notes }
      },
      { upsert: true }
    )
      .then(user => {
        if (user.nModified) {
          res.send({
            note: true
          });
        } else {
          res.send({
            note: false,
            error: true,
            message: "Verse already noted"
          });
        }
      })
      .catch(err => {
        return res.status(500).send({
          note: false,
          error: true,
          message: "Verse not note"
        });
      });
  } else {
    res.send({
      note: false,
      error: true,
      message: "Verse not note"
    });
  }
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
