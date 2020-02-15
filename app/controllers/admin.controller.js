const Admin = require("../models/admin.model.js");

exports.createBroadcast = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Broadcast Alert can not be empty"
    });
  }

  let user = new Admin(req.body);
  user
    .save()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while creating the broadcast alert."
      });
    });
};

exports.findAll = (req, res) => {
  Admin.find()
    .then(data => {
      res.send({
        status: true,
        message: "Fetched all users successfully!",
        data: data
      });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users."
      });
    });
};
