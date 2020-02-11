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
      if (!user) {
        return res.status(404).send({
          message: "User not found with email " + email
        });
      }
      bcrypt
        .compare(password, user[0].users[0].password)
        .then(function(result) {
          if (result) {
            res.send(user);
          } else {
            return res.status(400).send({ message: "The password is invalid" });
          }
        });
    })
    .catch(err => {
      return res.status(500).send({
        message: "Error retrieving user with email " + email
      });
    });
};

exports.findAll = (req, res) => {
  User.find()
    .then(users => {
      res.send(users);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users."
      });
    });
};
