const bcrypt = require("bcrypt");
const User = require("../models/user.model.js");

// Create and Save a new User
exports.create = async (req, res) => {
  if (!req.body.users) {
    return res.status(400).send({
      message: "User can not be empty"
    });
  }

  let user = new User(req.body);
  let salt = await bcrypt.genSalt(10);
  user.users[0].password = await bcrypt.hash(user.users[0].password, salt);
  user.users[0].created = new Date();
  // Save User in the database
  user
    .save()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the User."
      });
    });
};

// Find a single user with a email
exports.findOne = async (req, res) => {
  let { email, password } = req.body;
  const data = {
    "users.email": email
  };
  User.find(data)
    .then(user => {
      if (user.length === 0) {
        return res.status(404).send({
          status: false,
          message: "User not found!"
        });
      }
      bcrypt
        .compare(password, user[0].users[0].password)
        .then(function(result) {
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
      let users = [];
      let adminAlert = {};
      let confirmedUsers = [];
      for (let i = 0; i < data.length; i++) {
        users.push(...data[i].users);
        //adminAlert.push(data[i].admin) || [];
      }
      for (let i = 0; i < users.length; i++) {
        confirmedUsers.push({
          userID: users[i]._id,
          userEmail: users[i].email,
          signUpDate: users[i].created,
          confirmed: users[i].confirmed || false
        });
      }
      let usersData = {
        users: users,
        confirmedEmail: confirmedUsers
      };
      res.send({
        status: true,
        message: "Fetched all users successfully!",
        data: usersData
      });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users."
      });
    });
};

exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "User can not be empty"
    });
  }
  User.update(
    {
      "users._id": req.params.userId
    },
    {
      $set: req.body
    }
  )
    .then(user => {
      if (!user) {
        return res.status(404).send({
          message: "User not found with id " + req.params.userId
        });
      }
      res.send(user);
    })
    .catch(err => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "User not found with id " + req.params.userId
        });
      }
      return res.status(500).send({
        message: "Error updating user with id " + err
      });
    });
};
