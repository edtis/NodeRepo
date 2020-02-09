const bcrypt = require("bcrypt");
const User = require("../models/user.model.js");

// Create and Save a new User
exports.create = async (req, res) => {
  if (!req.body.users) {
    return res.status(400).send({
      message: "User can not be empty"
    });
  }

  /* let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).send("User already exist!");
  } else { */
  // Create a User
  let user = new User(req.body);
  /* let salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt); */
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
  //  }
};

// Find a single user with a email
exports.findOne = (req, res) => {
  const { email, password } = req.body;
  const data = {
    email: email,
    password: password
  };
  User.find(data)
    .then(user => {
      if (!user) {
        return res.status(404).send({
          message: "User not found with email " + email
        });
      }
      res.send(user);
    })
    .catch(err => {
      if (err.kind === "String") {
        return res.status(404).send({
          message: "User not found with email " + email
        });
      }
      return res.status(500).send({
        message: "Error retrieving user with email " + email + err
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
