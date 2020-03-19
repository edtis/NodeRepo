const bcrypt = require("bcrypt");
const User = require("../models/user.model.js");
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
            res.send({
              auth: user[0].confirmedEmail,
              error: false,
              message: "Logged in successfully",
              databaseID: user[0]._id,
              hightlight: user[0].highlighted,
              bold: user[0].bolded,
              underline: user[0].underlined,
              italic: user[0].italicized,
              notes: user[0].notes,
              referenceTags: user[0].referenceTags,
              favorite: user[0].favs
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
          res.send({
            auth: user[0].confirmedEmail,
            error: false,
            message: "Retrieve data successfully",
            databaseID: user[0]._id,
            hightlight: user[0].highlighted,
            bold: user[0].bolded,
            underline: user[0].underlined,
            Italic: user[0].italicized,
            notes: user[0].notes,
            referenceTags: user[0].referenceTags,
            favorite: user[0].favs
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
  if (req.body.length === 0) {
    return res.status(400).send({
      highlight: false,
      error: true,
      message: "Highlight can not be empty"
    });
  }
  let {
    highlight,
    username,
    databaseID,
    book,
    chapter,
    verse,
    color
  } = req.body[0];
  if (highlight === true) {
    const data = {
      email: username,
      _id: databaseID
    };
    User.find(data)
      .then(user => {
        if (user.length === 0) {
          return res.status(404).send({
            highlight: false,
            error: true,
            message: "Verse not highlighted"
          });
        } else {
          let highlighted = user[0].highlighted;
          let results = highlighted.filter(function(entry) {
            return (
              entry.book === book &&
              entry.chapter === chapter &&
              entry.verse === verse &&
              entry.color === color
            );
          });
          if (results.length > 0) {
            res.send({
              highlight: true
            });
          } else {
            res.send({
              highlight: false,
              error: true,
              message: "Verse not highlighted"
            });
          }
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
  if (bold === true) {
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
  if (req.body.length === 0) {
    return res.status(400).send({
      underlined: false,
      error: true,
      message: "Underlined can not be empty"
    });
  }
  let { underlined, username, databaseID, book, chapter, verse } = req.body[0];
  if (underlined === true) {
    const data = {
      email: username,
      _id: databaseID
    };
    User.find(data)
      .then(user => {
        if (user.length === 0) {
          return res.status(404).send({
            underlined: false,
            error: true,
            message: "Verse not underlined"
          });
        } else {
          let underlined = user[0].underlined;
          let results = underlined.filter(function(entry) {
            return (
              entry.book === book &&
              entry.chapter === chapter &&
              entry.verse === verse
            );
          });
          if (results.length > 0) {
            res.send({
              underlined: true
            });
          } else {
            res.send({
              underlined: false,
              error: true,
              message: "Verse not underlined"
            });
          }
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
  if (req.body.length === 0) {
    return res.status(400).send({
      referenceTags: false,
      error: true,
      message: "ReferenceTags can not be empty"
    });
  }
  let {
    referenceTags,
    username,
    databaseID,
    book,
    chapter,
    verse
  } = req.body[0];
  if (referenceTags === true) {
    const data = {
      email: username,
      _id: databaseID
    };
    User.find(data)
      .then(user => {
        if (user.length === 0) {
          return res.status(404).send({
            referenceTags: false,
            error: true,
            message: "Reference Tag not applied"
          });
        } else {
          let referenceTags = user[0].referenceTags;
          let results = referenceTags.filter(function(entry) {
            return (
              entry.book === book &&
              entry.chapter === chapter &&
              entry.verse === verse
            );
          });
          if (results.length > 0) {
            res.send({
              referenceTags: true
            });
          } else {
            res.send({
              referenceTags: false,
              error: true,
              message: "Reference Tag not applied"
            });
          }
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
  if (req.body.length === 0) {
    return res.status(400).send({
      italic: false,
      error: true,
      message: "Italic can not be empty"
    });
  }
  let { italic, username, databaseID, book, chapter, verse } = req.body[0];
  if (italic === true) {
    const data = {
      email: username,
      _id: databaseID
    };
    User.find(data)
      .then(user => {
        res.send(user);
        if (user.length === 0) {
          return res.status(404).send({
            italic: false,
            error: true,
            message: "Verse not italic"
          });
        } else {
          let italicized = user[0].italicized;
          let results = italicized.filter(function(entry) {
            return (
              entry.book === book &&
              entry.chapter === chapter &&
              entry.verse === verse
            );
          });
          if (results.length > 0) {
            res.send({
              italic: true
            });
          } else {
            res.send({
              italic: false,
              error: true,
              message: "Verse not italic1"
            });
          }
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
  if (req.body.length === 0) {
    return res.status(400).send({
      favorite: false,
      error: true,
      message: "Favorite can not be empty"
    });
  }
  let { favorite, username, databaseID, book, chapter, verse } = req.body[0];
  if (favorite === true) {
    const data = {
      email: username,
      _id: databaseID
    };
    User.find(data)
      .then(user => {
        if (user.length === 0) {
          return res.status(404).send({
            favorite: false,
            error: true,
            message: "Verse not favorite"
          });
        } else {
          let favs = user[0].favs;
          let results = favs.filter(function(entry) {
            return (
              entry.book === book &&
              entry.chapter === chapter &&
              entry.verse === verse
            );
          });
          if (results.length > 0) {
            res.send({
              favorite: true
            });
          } else {
            res.send({
              favorite: false,
              error: true,
              message: "Verse not favorite"
            });
          }
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
  if (req.body.length === 0) {
    return res.status(400).send({
      note: false,
      error: true,
      message: "Note can not be empty"
    });
  }
  let { note, username, databaseID, book, chapter, verse } = req.body[0];
  if (note === true) {
    const data = {
      email: username,
      _id: databaseID
    };
    User.find(data)
      .then(user => {
        if (user.length === 0) {
          return res.status(404).send({
            note: false,
            error: true,
            message: "Verse not note"
          });
        } else {
          let notes = user[0].notes;
          let results = notes.filter(function(entry) {
            return (
              entry.book === book &&
              entry.chapter === chapter &&
              entry.verse === verse
            );
          });
          if (results.length > 0) {
            res.send({
              note: true
            });
          } else {
            res.send({
              note: false,
              error: true,
              message: "Verse not note"
            });
          }
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
