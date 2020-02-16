const bcrypt = require("bcrypt");
const User = require("../models/user.model.js");
const DisableUsers = require("../models/disableUsers.model.js");

exports.create = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      status: false,
      message: "User can not be empty"
    });
  }
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
          res.send({
            status: true,
            message: "Successfully created account.",
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

exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      status: false,
      message: "User can not be empty"
    });
  }
  User.update(
    {
      _id: req.params.userId
    },
    {
      $set: req.body
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
