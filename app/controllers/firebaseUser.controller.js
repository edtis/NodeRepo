const database = require("../../config/firebase.config");
var UserRef = database.ref("users");

exports.create = async (req, res) => {
  var data = req.body;
  if (Object.keys(data).length === 0) {
    return res.status(400).send({
      status: false,
      message: "User can not be empty"
    });
  }
  UserRef.push(data, function(err) {
    if (err) {
      res.send({
        status: false,
        message: "Somthing went wrong",
        error: err
      });
    } else {
      res.json({
        status: true,
        message: "User added successfully!",
        data
      });
    }
  });
};

exports.update = async (req, res) => {
  var data = req.body;
  if (Object.keys(data).length === 0) {
    return res.status(400).send({
      status: false,
      message: "User can not be empty"
    });
  }
  var uid = "-MElBgapoEvEumMIKAMQ";
  UserRef.child(uid).update(data, function(err) {
    if (err) {
      res.send({
        status: false,
        message: "Somthing went wrong",
        error: err
      });
    } else {
      res.json({
        status: true,
        message: "User updated successfully!",
        data
      });
    }
  });
};

exports.delete = async (req, res) => {
  var uid = "-MElBgapoEvEumMIKAMQ";
  if (!uid) {
    return res.status(400).send({
      status: false,
      message: "User id can not be empty"
    });
  }
  UserRef.child(uid).remove(function(err) {
    if (err) {
      res.send({
        status: false,
        message: "Somthing went wrong",
        error: err
      });
    } else {
      res.json({
        status: true,
        message: "User deleted successfully!"
      });
    }
  });
};

exports.getUsers = async (req, res) => {
  UserRef.once("value", function(snapshot) {
    if (snapshot.val() === null) {
      res.json({
        status: false,
        message: "No user found!"
      });
    } else {
      res.json({
        status: true,
        message: "Users fetched successfully!",
        data: snapshot.val()
      });
    }
  });
};
