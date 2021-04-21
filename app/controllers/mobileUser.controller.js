const bcrypt = require("bcrypt");
const User = require("../models/user.model.js");
const userController = require("../controllers/user.controller");

var rand, link;
var verificationCode = "tbtxzt738";
var baseUrl = "https://goodbookbible.study";

exports.resetPassword = (req, res) => {
  if (!req.body.email) {
    return res.status(400).send({
      status: false,
      message: "Email can not be empty",
    });
  }
  var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var token = "";
  for (var i = 16; i > 0; --i) {
    token += chars[Math.round(Math.random() * (chars.length - 1))];
  }
  rand = token;
  link = baseUrl + "/reset/password?id=" + rand;

  User.findOne({ email: req.body.email }).then((email) => {
    if (email) {
      userController.resetPasswordEmailSent(email, link, rand);
      res.send({
        status: true,
        message: "Reset link has been sent to your email",
      });
    } else {
      res.send({
        status: false,
        message: "User with email not found!",
      });
    }
  });
};

exports.create = async (req, res) => {
  if (req.body.verificationCode !== verificationCode) {
    res.status(500).send({
      auth: false,
      error: true,
      message: "Access denied",
    });
  }
  if (req.body.register === true) {
    if (!req.body) {
      return res.status(400).send({
        auth: false,
        error: true,
        message: "User can not be empty",
      });
    }
    var chars =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var token = "";
    for (var i = 16; i > 0; --i) {
      token += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    rand = token;
    link = baseUrl + "/verify?id=" + rand;
    req.body.email = req.body.username;
    delete req.body["username"];
    let user = new User(req.body);
    let salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user.created = new Date();
    User.findOne({ email: user.email }).then((email) => {
      if (email) {
        res.send({
          auth: false,
          error: true,
          message: "User already exist",
        });
      } else {
        user
          .save()
          .then((data) => {
            userController.createUserEmailSent(data, link, rand);
            res.send({
              userRegistered: true,
              error: false,
              message: "Confirmation Email Sent",
            });
          })
          .catch((err) => {
            res.status(500).send({
              auth: false,
              error: true,
              message: "User not registered",
            });
          });
      }
    });
  } else {
    res.send({
      auth: false,
      error: true,
      message: "User not registered",
    });
  }
};

// Find a single user with a email
exports.findOne = async (req, res) => {
  let { username, password, login } = req.body;
  if (login === true) {
    const data = {
      email: username,
    };
    User.find(data)
      .then((user) => {
        if (user.length === 0) {
          return res.status(404).send({
            auth: false,
            error: true,
            message: "Username/ password incorrect",
          });
        }
        bcrypt.compare(password, user[0].password).then(function (result) {
          if (result) {
            if (!user[0].confirmedEmail) {
              return res.status(200).send({
                auth: false,
                error: true,
                unconfirmed: true,
                message: "User is not confirmed",
              });
            }
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
              firstName: user[0].firstName || null,
              lastName: user[0].lastName || null,
              email: user[0].email || null,
              created: user[0].created || null,
              lastLogin: user[0].lastLogin || null,
              confirmedEmail: user[0].confirmedEmail || null,
              hightlight: highlighted ? user[0].highlighted : [],
              bold: bolded ? user[0].bolded : [],
              underline: underlined ? user[0].underlined : [],
              Italic: italicized ? user[0].italicized : [],
              notes: notes ? user[0].notes : [],
              referenceTags: referenceTags ? user[0].referenceTags : [],
              favorite: favs ? user[0].favs : [],
            });
          } else {
            return res.status(400).send({
              auth: false,
              error: true,
              message: "Username/ password incorrect",
            });
          }
        });
      })
      .catch((err) => {
        return res.status(500).send({
          auth: false,
          error: true,
          message: "Internal server error!",
        });
      });
  } else {
    res.send({
      auth: false,
      error: true,
      message: "Username/ password incorrect",
    });
  }
};

// Find a single user with a email
exports.all = async (req, res) => {
  let { username, databaseID, all } = req.body;
  if (all === true) {
    const data = {
      email: username,
      _id: databaseID,
    };
    User.find(data)
      .then((user) => {
        if (user.length === 0) {
          return res.status(404).send({
            all: false,
            error: true,
            message: "Cannot retrieve data",
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
            favorite: favs ? user[0].favs : [],
          });
        }
      })
      .catch((err) => {
        return res.status(500).send({
          all: false,
          error: true,
          message: "Cannot retrieve data",
        });
      });
  } else {
    res.send({
      all: false,
      error: true,
      message: "Cannot retrieve data",
    });
  }
};

exports.highlight = async (req, res) => {
  let { highlight, username, databaseID, highlighted } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      highlight: false,
      error: true,
      message: "Highlight can not be empty",
    });
  }
  if (highlight === true && highlighted) {
    const data = {
      email: username,
      _id: databaseID,
    };
    User.update(
      data,
      {
        $set: { highlighted: highlighted },
      },
      { upsert: true }
    )
      .then((user) => {
        if (user.nModified) {
          res.send({
            highlight: true,
          });
        } else {
          res.send({
            highlight: false,
            error: true,
            message: "Verse already highlighted",
          });
        }
      })
      .catch((err) => {
        return res.status(500).send({
          highlight: false,
          error: true,
          message: "Verse not highlighted",
        });
      });
  } else {
    res.send({
      highlight: false,
      error: true,
      message: "Verse not highlighted",
    });
  }
};

exports.highlightUpdate = async (req, res) => {
  let { highlight, username, databaseID, highlighted, add } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      highlight: false,
      error: true,
      message: "Highlight can not be empty",
    });
  }
  if (highlight === true && highlighted) {
    const data = {
      email: username,
      _id: databaseID,
    };
    User.find(data).then((user) => {
      let highlightData = user[0].highlighted || [];
      for (let i = 0; i < highlightData.length; i++) {
        for (let j = 0; j < highlighted.length; j++) {
          if (
            highlightData[i].book === highlighted[j].book &&
            highlightData[i].chapter === highlighted[j].chapter &&
            highlightData[i].verse === highlighted[j].verse
          ) {
            let index = highlightData.indexOf(highlightData[i]);
            if (index > -1) {
              highlightData.splice(index, 1);
            }
          }
        }
      }
      let updatedHighlight = null;
      if (add === true) {
        updatedHighlight = [...highlightData, ...highlighted];
      } else {
        updatedHighlight = [...highlightData];
      }
      User.update(
        data,
        {
          $set: { highlighted: updatedHighlight },
        },
        { upsert: true }
      )
        .then((user) => {
          if (user.nModified) {
            res.send({
              highlight: true,
              allHighlights: updatedHighlight,
            });
          } else {
            res.send({
              highlight: false,
              error: true,
              message: "Verse already highlighted",
            });
          }
        })
        .catch((err) => {
          return res.status(500).send({
            highlight: false,
            error: true,
            message: "Verse not highlighted",
          });
        });
    });
  } else {
    res.send({
      highlight: false,
      error: true,
      message: "Verse not highlighted",
    });
  }
};

exports.highlightSync = async (req, res) => {
  let { highlight, username, databaseID, highlighted, add } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      highlight: false,
      error: true,
      message: "Highlight can not be empty",
    });
  }
  if (highlight === true && highlighted) {
    const data = {
      email: username,
      _id: databaseID,
    };
    User.find(data).then((user) => {
      let highlightData = user[0].highlighted || [];
      if (highlighted.length === 0) {
        return res.status(200).send({
          highlight: true,
          allHighlights: highlightData,
        });
      }
      selectedData = highlightData.filter(function (hd) {
        return !highlighted.find(function (h) {
          return (
            hd.book === h.book &&
            hd.chapter === h.chapter &&
            hd.verse === h.verse
          );
        });
      });
      let updatedHighlight = null;
      if (add === true) {
        updatedHighlight = [...selectedData, ...highlighted];
      } else {
        updatedHighlight = [...selectedData];
      }

      updatedHighlight = Array.from(
        new Set(updatedHighlight.map(JSON.stringify))
      ).map(JSON.parse);

      User.update(
        data,
        {
          $set: { highlighted: updatedHighlight },
        },
        { upsert: true }
      )
        .then((user) => {
          if (user.nModified) {
            res.send({
              highlight: true,
              allHighlights: updatedHighlight,
            });
          } else {
            res.send({
              highlight: false,
              error: true,
              message: "Verse already highlighted",
            });
          }
        })
        .catch((err) => {
          return res.status(500).send({
            highlight: false,
            error: true,
            message: "Verse not highlighted",
          });
        });
    });
  } else {
    res.send({
      highlight: false,
      error: true,
      message: "Verse not highlighted",
    });
  }
};

exports.bold = async (req, res) => {
  let { bold, username, databaseID, bolded } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      bold: false,
      error: true,
      message: "Bolded can not be empty",
    });
  }
  if (bold === true && bolded) {
    const data = {
      email: username,
      _id: databaseID,
    };
    User.update(
      data,
      {
        $set: { bolded: bolded },
      },
      { upsert: true }
    )
      .then((user) => {
        if (user.nModified) {
          res.send({
            bold: true,
          });
        } else {
          res.send({
            bold: false,
            error: true,
            message: "Verse already bolded",
          });
        }
      })
      .catch((err) => {
        return res.status(500).send({
          bold: false,
          error: true,
          message: "Verse not bolded",
        });
      });
  } else {
    res.send({
      bold: false,
      error: true,
      message: "Verse not bolded",
    });
  }
};

exports.boldUpdate = async (req, res) => {
  let { bold, username, databaseID, bolded, add } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      bold: false,
      error: true,
      message: "Bolded can not be empty",
    });
  }
  if (bold === true && bolded) {
    const data = {
      email: username,
      _id: databaseID,
    };
    User.find(data).then((user) => {
      let boldData = user[0].bolded || [];
      for (let i = 0; i < boldData.length; i++) {
        for (let j = 0; j < bolded.length; j++) {
          if (
            boldData[i].book === bolded[j].book &&
            boldData[i].chapter === bolded[j].chapter &&
            boldData[i].verse === bolded[j].verse
          ) {
            let index = boldData.indexOf(boldData[i]);
            if (index > -1) {
              boldData.splice(index, 1);
            }
          }
        }
      }
      let updatedBold = null;
      if (add === true) {
        updatedBold = [...boldData, ...bolded];
      } else {
        updatedBold = [...boldData];
      }
      User.update(
        data,
        {
          $set: { bolded: updatedBold },
        },
        { upsert: true }
      )
        .then((user) => {
          if (user.nModified) {
            res.send({
              bold: true,
              allBolds: updatedBold,
            });
          } else {
            res.send({
              bold: false,
              error: true,
              message: "Verse already bolded",
            });
          }
        })
        .catch((err) => {
          return res.status(500).send({
            bold: false,
            error: true,
            message: "Verse not bolded",
          });
        });
    });
  } else {
    res.send({
      bold: false,
      error: true,
      message: "Verse not bolded",
    });
  }
};

exports.boldSync = async (req, res) => {
  let { bold, username, databaseID, bolded, add } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      bold: false,
      error: true,
      message: "Bolded can not be empty",
    });
  }
  if (bold === true && bolded) {
    const data = {
      email: username,
      _id: databaseID,
    };
    User.find(data)
      .then((user) => {
        let boldData = user[0].bolded || [];
        if (bolded.length === 0) {
          return res.status(200).send({
            bold: true,
            allBolds: boldData,
          });
        }
        selectedData = boldData.filter(function (bd) {
          return !bolded.find(function (b) {
            return (
              bd.book === b.book &&
              bd.chapter === b.chapter &&
              bd.verse === b.verse
            );
          });
        });
        let updatedBold = null;
        if (add === true) {
          updatedBold = [...selectedData, ...bolded];
        } else {
          updatedBold = [...selectedData];
        }
        updatedBold = Array.from(new Set(updatedBold.map(JSON.stringify))).map(
          JSON.parse
        );

        User.update(
          data,
          {
            $set: { bolded: updatedBold },
          },
          { upsert: true }
        )
          .then((user) => {
            if (user.nModified) {
              res.send({
                bold: true,
                allBolds: updatedBold,
              });
            } else {
              res.send({
                bold: false,
                error: true,
                message: "Verse already bolded",
              });
            }
          })
          .catch((err) => {
            return res.status(500).send({
              bold: false,
              error: true,
              message: "Verse not bolded",
            });
          });
      })
      .catch((err) => {
        return res.status(500).send({
          bold: false,
          error: true,
          message: "Verse not bolded",
        });
      });
  } else {
    res.send({
      bold: false,
      error: true,
      message: "Verse not bolded",
    });
  }
};

exports.underline = async (req, res) => {
  let { underline, username, databaseID, underlined } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      underlined: false,
      error: true,
      message: "Underlined can not be empty",
    });
  }
  if (underline === true && underlined) {
    const data = {
      email: username,
      _id: databaseID,
    };
    User.update(
      data,
      {
        $set: { underlined: underlined },
      },
      { upsert: true }
    )
      .then((user) => {
        if (user.nModified) {
          res.send({
            underlined: true,
          });
        } else {
          res.send({
            underlined: false,
            error: true,
            message: "Verse already underlined",
          });
        }
      })
      .catch((err) => {
        return res.status(500).send({
          underlined: false,
          error: true,
          message: "Verse not underlined",
        });
      });
  } else {
    res.send({
      underlined: false,
      error: true,
      message: "Verse not underlined",
    });
  }
};

exports.underlineUpdate = async (req, res) => {
  let { underline, username, databaseID, underlined, add } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      underlined: false,
      error: true,
      message: "Underlined can not be empty",
    });
  }
  if (underline === true && underlined) {
    const data = {
      email: username,
      _id: databaseID,
    };
    User.find(data).then((user) => {
      let underlinedData = user[0].underlined || [];
      for (let i = 0; i < underlinedData.length; i++) {
        for (let j = 0; j < underlined.length; j++) {
          if (
            underlinedData[i].book === underlined[j].book &&
            underlinedData[i].chapter === underlined[j].chapter &&
            underlinedData[i].verse === underlined[j].verse
          ) {
            let index = underlinedData.indexOf(underlinedData[i]);
            if (index > -1) {
              underlinedData.splice(index, 1);
            }
          }
        }
      }
      let updatedUnderlined = null;
      if (add === true) {
        updatedUnderlined = [...underlinedData, ...underlined];
      } else {
        updatedUnderlined = [...underlinedData];
      }
      User.update(
        data,
        {
          $set: { underlined: updatedUnderlined },
        },
        { upsert: true }
      )
        .then((user) => {
          if (user.nModified) {
            res.send({
              underlined: true,
              allUnderline: updatedUnderlined,
            });
          } else {
            res.send({
              underlined: false,
              error: true,
              message: "Verse already underlined",
            });
          }
        })
        .catch((err) => {
          return res.status(500).send({
            underlined: false,
            error: true,
            message: "Verse not underlined",
          });
        });
    });
  } else {
    res.send({
      underlined: false,
      error: true,
      message: "Verse not underlined",
    });
  }
};

exports.underlineSync = async (req, res) => {
  let { underline, username, databaseID, underlined, add } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      underlined: false,
      error: true,
      message: "Underlined can not be empty",
    });
  }
  if (underline === true && underlined) {
    const data = {
      email: username,
      _id: databaseID,
    };
    User.find(data).then((user) => {
      let underlinedData = user[0].underlined || [];
      if (underlined.length === 0) {
        return res.status(200).send({
          underlined: true,
          allUnderline: underlinedData,
        });
      }
      selectedData = underlinedData.filter(function (ud) {
        return !underlined.find(function (u) {
          return (
            ud.book === u.book &&
            ud.chapter === u.chapter &&
            ud.verse === u.verse
          );
        });
      });
      let updatedUnderlined = null;
      if (add === true) {
        updatedUnderlined = [...selectedData, ...underlined];
      } else {
        updatedUnderlined = [...selectedData];
      }

      updatedUnderlined = Array.from(
        new Set(updatedUnderlined.map(JSON.stringify))
      ).map(JSON.parse);

      User.update(
        data,
        {
          $set: { underlined: updatedUnderlined },
        },
        { upsert: true }
      )
        .then((user) => {
          if (user.nModified) {
            res.send({
              underlined: true,
              allUnderline: updatedUnderlined,
            });
          } else {
            res.send({
              underlined: false,
              error: true,
              message: "Verse already underlined",
            });
          }
        })
        .catch((err) => {
          return res.status(500).send({
            underlined: false,
            error: true,
            message: "Verse not underlined",
          });
        });
    });
  } else {
    res.send({
      underlined: false,
      error: true,
      message: "Verse not underlined",
    });
  }
};

exports.referencetags = async (req, res) => {
  let { referenceTag, username, databaseID, referenceTags } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      referenceTags: false,
      error: true,
      message: "ReferenceTags can not be empty",
    });
  }
  if (referenceTag === true && referenceTags) {
    const data = {
      email: username,
      _id: databaseID,
    };
    User.update(
      data,
      {
        $set: { referenceTags: referenceTags },
      },
      { upsert: true }
    )
      .then((user) => {
        if (user.nModified) {
          res.send({
            referenceTags: true,
          });
        } else {
          res.send({
            referenceTags: false,
            error: true,
            message: "Reference Tag already applied",
          });
        }
      })
      .catch((err) => {
        return res.status(500).send({
          referenceTags: false,
          error: true,
          message: "Reference Tag not applied",
        });
      });
  } else {
    res.send({
      referenceTags: false,
      error: true,
      message: "Reference Tag not applied",
    });
  }
};

exports.referencetagsUpdate = async (req, res) => {
  let { referenceTag, username, databaseID, referenceTags } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      referenceTags: false,
      error: true,
      message: "ReferenceTags can not be empty",
    });
  }
  if (referenceTag === true && referenceTags) {
    const data = {
      email: username,
      _id: databaseID,
    };
    User.find(data).then((user) => {
      let referenceTagsData = user[0].referenceTags || [];
      for (let i = 0; i < referenceTagsData.length; i++) {
        for (let j = 0; j < referenceTags.length; j++) {
          if (
            referenceTagsData[i].book === referenceTags[j].book &&
            referenceTagsData[i].chapter === referenceTags[j].chapter &&
            referenceTagsData[i].verse === referenceTags[j].verse
          ) {
            let index = referenceTagsData.indexOf(referenceTagsData[i]);
            if (index > -1) {
              referenceTagsData.splice(index, 1);
            }
          }
        }
      }
      let updatedReferenceTags = null;
      if (referenceTags[0].Tags.length) {
        updatedReferenceTags = [...referenceTagsData, ...referenceTags];
      } else {
        updatedReferenceTags = [...referenceTagsData];
      }
      User.update(
        data,
        {
          $set: { referenceTags: updatedReferenceTags },
        },
        { upsert: true }
      )
        .then((user) => {
          if (user.nModified) {
            res.send({
              referenceTags: true,
              allReferenceTags: updatedReferenceTags,
            });
          } else {
            res.send({
              referenceTags: false,
              error: true,
              message: "Reference Tag already applied",
            });
          }
        })
        .catch((err) => {
          return res.status(500).send({
            referenceTags: false,
            error: true,
            message: "Reference Tag not applied",
          });
        });
    });
  } else {
    res.send({
      referenceTags: false,
      error: true,
      message: "Reference Tag not applied",
    });
  }
};

exports.referencetagsSync = async (req, res) => {
  let { referenceTag, username, databaseID, referenceTags } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      referenceTags: false,
      error: true,
      message: "ReferenceTags can not be empty",
    });
  }
  if (referenceTag === true && referenceTags) {
    const data = {
      email: username,
      _id: databaseID,
    };
    User.find(data).then((user) => {
      let referenceTagsData = user[0].referenceTags || [];
      if (referenceTags.length === 0) {
        return res.status(200).send({
          referenceTags: true,
          allReferenceTags: referenceTagsData,
        });
      }
      selectedData = referenceTagsData.filter(function (rd) {
        return !referenceTags.find(function (r) {
          return (
            rd.book === r.book &&
            rd.chapter === r.chapter &&
            rd.verse === r.verse
          );
        });
      });
      let updatedReferenceTags = null;
      if (referenceTags[0].Tags.length) {
        updatedReferenceTags = [...selectedData, ...referenceTags];
      } else {
        updatedReferenceTags = [...selectedData];
      }
      updatedReferenceTags = Array.from(
        new Set(updatedReferenceTags.map(JSON.stringify))
      ).map(JSON.parse);

      User.update(
        data,
        {
          $set: { referenceTags: updatedReferenceTags },
        },
        { upsert: true }
      )
        .then((user) => {
          if (user.nModified) {
            res.send({
              referenceTags: true,
              allReferenceTags: updatedReferenceTags,
            });
          } else {
            res.send({
              referenceTags: false,
              error: true,
              message: "Reference Tag already applied",
            });
          }
        })
        .catch((err) => {
          return res.status(500).send({
            referenceTags: false,
            error: true,
            message: "Reference Tag not applied",
          });
        });
    });
  } else {
    res.send({
      referenceTags: false,
      error: true,
      message: "Reference Tag not applied",
    });
  }
};

exports.italic = async (req, res) => {
  let { italic, username, databaseID, italicized } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      italic: false,
      error: true,
      message: "Italic can not be empty",
    });
  }
  if (italic === true && italicized) {
    const data = {
      email: username,
      _id: databaseID,
    };
    User.update(
      data,
      {
        $set: { italicized: italicized },
      },
      { upsert: true }
    )
      .then((user) => {
        if (user.nModified) {
          res.send({
            italic: true,
          });
        } else {
          res.send({
            italic: false,
            error: true,
            message: "Verse already italic",
          });
        }
      })
      .catch((err) => {
        return res.status(500).send({
          italic: false,
          error: true,
          message: "Verse not italic",
        });
      });
  } else {
    res.send({
      italic: false,
      error: true,
      message: "Verse not italic",
    });
  }
};

exports.italicUpdate = async (req, res) => {
  let { italic, username, databaseID, italicized, add } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      italic: false,
      error: true,
      message: "Italic can not be empty",
    });
  }
  if (italic === true && italicized) {
    const data = {
      email: username,
      _id: databaseID,
    };
    User.find(data).then((user) => {
      let italicizedData = user[0].italicized || [];
      for (let i = 0; i < italicizedData.length; i++) {
        for (let j = 0; j < italicized.length; j++) {
          if (
            italicizedData[i].book === italicized[j].book &&
            italicizedData[i].chapter === italicized[j].chapter &&
            italicizedData[i].verse === italicized[j].verse
          ) {
            let index = italicizedData.indexOf(italicizedData[i]);
            if (index > -1) {
              italicizedData.splice(index, 1);
            }
          }
        }
      }
      let updatedItalicized = null;
      if (add === true) {
        updatedItalicized = [...italicizedData, ...italicized];
      } else {
        updatedItalicized = [...italicizedData];
      }
      User.update(
        data,
        {
          $set: { italicized: updatedItalicized },
        },
        { upsert: true }
      )
        .then((user) => {
          if (user.nModified) {
            res.send({
              italic: true,
              allItalics: updatedItalicized,
            });
          } else {
            res.send({
              italic: false,
              error: true,
              message: "Verse already italic",
            });
          }
        })
        .catch((err) => {
          return res.status(500).send({
            italic: false,
            error: true,
            message: "Verse not italic",
          });
        });
    });
  } else {
    res.send({
      italic: false,
      error: true,
      message: "Verse not italic",
    });
  }
};

exports.italicSync = async (req, res) => {
  let { italic, username, databaseID, italicized, add } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      italic: false,
      error: true,
      message: "Italic can not be empty",
    });
  }
  if (italic === true && italicized) {
    const data = {
      email: username,
      _id: databaseID,
    };
    User.find(data).then((user) => {
      let italicizedData = user[0].italicized || [];
      if (italicized.length === 0) {
        return res.status(200).send({
          italic: true,
          allItalics: italicizedData,
        });
      }
      selectedData = italicizedData.filter(function (id) {
        return !italicized.find(function (i) {
          return (
            id.book === i.book &&
            id.chapter === i.chapter &&
            id.verse === i.verse
          );
        });
      });
      let updatedItalicized = null;
      if (add === true) {
        updatedItalicized = [...selectedData, ...italicized];
      } else {
        updatedItalicized = [...selectedData];
      }

      updatedItalicized = Array.from(
        new Set(updatedItalicized.map(JSON.stringify))
      ).map(JSON.parse);

      User.update(
        data,
        {
          $set: { italicized: updatedItalicized },
        },
        { upsert: true }
      )
        .then((user) => {
          if (user.nModified) {
            res.send({
              italic: true,
              allItalics: updatedItalicized,
            });
          } else {
            res.send({
              italic: false,
              error: true,
              message: "Verse already italic",
            });
          }
        })
        .catch((err) => {
          return res.status(500).send({
            italic: false,
            error: true,
            message: "Verse not italic",
          });
        });
    });
  } else {
    res.send({
      italic: false,
      error: true,
      message: "Verse not italic",
    });
  }
};

exports.favorite = async (req, res) => {
  let { favorite, username, databaseID, favs } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      favorite: false,
      error: true,
      message: "Favorite can not be empty",
    });
  }
  if (favorite === true && favs) {
    const data = {
      email: username,
      _id: databaseID,
    };
    User.update(
      data,
      {
        $set: { favs: favs },
      },
      { upsert: true }
    )
      .then((user) => {
        if (user.nModified) {
          res.send({
            favorite: true,
          });
        } else {
          res.send({
            favorite: false,
            error: true,
            message: "Verse already favorited",
          });
        }
      })
      .catch((err) => {
        return res.status(500).send({
          favorite: false,
          error: true,
          message: "Verse not favorite",
        });
      });
  } else {
    res.send({
      favorite: false,
      error: true,
      message: "Verse not favorite",
    });
  }
};

exports.favoriteUpdate = async (req, res) => {
  let { favorite, username, databaseID, favs, add } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      favorite: false,
      error: true,
      message: "Favorite can not be empty",
    });
  }
  if (favorite === true && favs) {
    const data = {
      email: username,
      _id: databaseID,
    };
    User.find(data).then((user) => {
      let favsData = user[0].favs || [];
      for (let i = 0; i < favsData.length; i++) {
        for (let j = 0; j < favs.length; j++) {
          if (
            favsData[i].book === favs[j].book &&
            favsData[i].chapter === favs[j].chapter &&
            favsData[i].verse === favs[j].verse
          ) {
            let index = favsData.indexOf(favsData[i]);
            if (index > -1) {
              favsData.splice(index, 1);
            }
          }
        }
      }
      let updatedFavs = null;
      if (add === true) {
        updatedFavs = [...favsData, ...favs];
      } else {
        updatedFavs = [...favsData];
      }
      User.update(
        data,
        {
          $set: { favs: updatedFavs },
        },
        { upsert: true }
      )
        .then((user) => {
          if (user.nModified) {
            res.send({
              favorite: true,
              allFavorite: updatedFavs,
            });
          } else {
            res.send({
              favorite: false,
              error: true,
              message: "Verse already favorited",
            });
          }
        })
        .catch((err) => {
          return res.status(500).send({
            favorite: false,
            error: true,
            message: "Verse not favorite",
          });
        });
    });
  } else {
    res.send({
      favorite: false,
      error: true,
      message: "Verse not favorite",
    });
  }
};

exports.favoriteSync = async (req, res) => {
  let { favorite, username, databaseID, favs, add } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      favorite: false,
      error: true,
      message: "Favorite can not be empty",
    });
  }
  if (favorite === true && favs) {
    const data = {
      email: username,
      _id: databaseID,
    };
    User.find(data).then((user) => {
      let favsData = user[0].favs || [];
      if (favs.length === 0) {
        return res.status(200).send({
          favorite: true,
          allFavorite: favsData,
        });
      }
      selectedData = favsData.filter(function (fd) {
        return !favs.find(function (f) {
          return (
            fd.book === f.book &&
            fd.chapter === f.chapter &&
            fd.verse === f.verse
          );
        });
      });
      let updatedFavs = null;
      if (add === true) {
        updatedFavs = [...selectedData, ...favs];
      } else {
        updatedFavs = [...selectedData];
      }
      updatedFavs = Array.from(new Set(updatedFavs.map(JSON.stringify))).map(
        JSON.parse
      );

      User.update(
        data,
        {
          $set: { favs: updatedFavs },
        },
        { upsert: true }
      )
        .then((user) => {
          if (user.nModified) {
            res.send({
              favorite: true,
              allFavorite: updatedFavs,
            });
          } else {
            res.send({
              favorite: false,
              error: true,
              message: "Verse already favorited",
            });
          }
        })
        .catch((err) => {
          return res.status(500).send({
            favorite: false,
            error: true,
            message: "Verse not favorite",
          });
        });
    });
  } else {
    res.send({
      favorite: false,
      error: true,
      message: "Verse not favorite",
    });
  }
};

exports.notes = async (req, res) => {
  let { note, username, databaseID, notes } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      note: false,
      error: true,
      message: "Note can not be empty",
    });
  }
  if (note === true && notes) {
    const data = {
      email: username,
      _id: databaseID,
    };
    User.update(
      data,
      {
        $set: { notes: notes },
      },
      { upsert: true }
    )
      .then((user) => {
        if (user.nModified) {
          res.send({
            note: true,
          });
        } else {
          res.send({
            note: false,
            error: true,
            message: "Verse already noted",
          });
        }
      })
      .catch((err) => {
        return res.status(500).send({
          note: false,
          error: true,
          message: "Verse not note",
        });
      });
  } else {
    res.send({
      note: false,
      error: true,
      message: "Verse not note",
    });
  }
};

exports.notesUpdate = async (req, res) => {
  let { note, username, databaseID, notes } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      note: false,
      error: true,
      message: "Note can not be empty",
    });
  }
  if (note === true && notes) {
    const data = {
      email: username,
      _id: databaseID,
    };
    User.find(data).then((user) => {
      let notesData = user[0].notes || [];
      for (let i = 0; i < notesData.length; i++) {
        for (let j = 0; j < notes.length; j++) {
          if (
            notesData[i].book === notes[j].book &&
            notesData[i].chapter === notes[j].chapter &&
            notesData[i].verse === notes[j].verse
          ) {
            let index = notesData.indexOf(notesData[i]);
            if (index > -1) {
              notesData.splice(index, 1);
            }
          }
        }
      }
      let updatedNotes = null;
      if (notes[0].note.length) {
        updatedNotes = [...notesData, ...notes];
      } else {
        updatedNotes = [...notesData];
      }
      User.update(
        data,
        {
          $set: { notes: updatedNotes },
        },
        { upsert: true }
      )
        .then((user) => {
          if (user.nModified) {
            res.send({
              note: true,
              allNotes: updatedNotes,
            });
          } else {
            res.send({
              note: false,
              error: true,
              message: "Verse already noted",
            });
          }
        })
        .catch((err) => {
          return res.status(500).send({
            note: false,
            error: true,
            message: "Verse not note",
          });
        });
    });
  } else {
    res.send({
      note: false,
      error: true,
      message: "Verse not note",
    });
  }
};

exports.notesSync = async (req, res) => {
  let { note, username, databaseID, notes } = req.body;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).send({
      note: false,
      error: true,
      message: "Note can not be empty",
    });
  }
  if (note === true && notes) {
    const data = {
      email: username,
      _id: databaseID,
    };
    User.find(data).then((user) => {
      let notesData = user[0].notes || [];
      if (notes.length === 0) {
        return res.status(200).send({
          note: true,
          allNotes: notesData,
        });
      }
      selectedData = notesData.filter(function (nd) {
        return !notes.find(function (n) {
          return (
            nd.book === n.book &&
            nd.chapter === n.chapter &&
            nd.verse === n.verse
          );
        });
      });
      let updatedNotes = null;
      if (notes[0].note.length) {
        updatedNotes = [...selectedData, ...notes];
      } else {
        updatedNotes = [...selectedData];
      }

      updatedNotes = Array.from(new Set(updatedNotes.map(JSON.stringify))).map(
        JSON.parse
      );

      User.update(
        data,
        {
          $set: { notes: updatedNotes },
        },
        { upsert: true }
      )
        .then((user) => {
          if (user.nModified) {
            res.send({
              note: true,
              allNotes: updatedNotes,
            });
          } else {
            res.send({
              note: false,
              error: true,
              message: "Verse already noted",
            });
          }
        })
        .catch((err) => {
          return res.status(500).send({
            note: false,
            error: true,
            message: "Verse not note",
          });
        });
    });
  } else {
    res.send({
      note: false,
      error: true,
      message: "Verse not note",
    });
  }
};

exports.update = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      status: false,
      message: "User can not be empty",
    });
  }
  let body = req.body;
  if (req.body.password) {
    let salt = await bcrypt.genSalt(10);
    body.password = await bcrypt.hash(body.password, salt);
  }

  User.update(
    {
      _id: req.params.userId,
    },
    {
      $set: body,
    }
  )
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          status: false,
          message: "User not found with id " + req.params.userId,
        });
      }
      res.send({
        status: true,
        message: "User updated successfully",
        user: user,
      });
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          status: false,
          message: "User not found with id " + req.params.userId,
        });
      }
      return res.status(500).send({
        status: false,
        message: "Error updating user with id " + err,
      });
    });
};
