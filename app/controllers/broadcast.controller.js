const Broadcast = require("../models/broadcast.model.js");

exports.create = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Broadcast Alert can not be empty"
    });
  }

  let user = new Broadcast(req.body);
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
  Broadcast.find()
    .then(data => {
      res.send({
        status: true,
        message: "Fetched all broadcast successfully!",
        data: data
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving broadcast."
      });
    });
};

exports.delete = (req, res) => {
  Broadcast.findByIdAndRemove(req.params.broadcastId)
    .then(broadcast => {
      if (!broadcast) {
        return res.status(404).send({
          message: "Broadcast not found with id " + req.params.broadcastId
        });
      }
      res.send({ message: "Broadcast deleted successfully!" });
    })
    .catch(err => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "Broadcast not found with id " + req.params.broadcastId
        });
      }
      return res.status(500).send({
        message: "Could not delete Broadcast with id " + req.params.broadcastId
      });
    });
};
