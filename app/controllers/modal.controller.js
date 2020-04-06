const Modal = require("../models/modal.model.js");

exports.create = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      status: false,
      message: "Modal Alert can not be empty"
    });
  }

  let user = new Modal(req.body);
  Modal.find()
    .then(data => {
      if (data.length < 1) {
        user
          .save()
          .then(data => {
            res.send({
              status: true,
              message: "Modal created successfully!",
              data: data
            });
          })
          .catch(err => {
            res.status(500).send({
              status: false,
              message:
                err.message ||
                "Some error occurred while creating the modal alert."
            });
          });
      } else {
        res.send({
          status: true,
          message: "Alert already exist!",
          data: data
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        status: false,
        message: err.message || "Some error occurred while creating modal."
      });
    });
};

exports.findAll = (req, res) => {
  Modal.find()
    .then(data => {
      res.send({
        status: true,
        message: "Fetched all modal successfully!",
        data: data
      });
    })
    .catch(err => {
      res.status(500).send({
        status: false,
        message: err.message || "Some error occurred while retrieving modal."
      });
    });
};

exports.delete = (req, res) => {
  Modal.findByIdAndRemove(req.params.modalId)
    .then(modal => {
      if (!modal) {
        return res.status(404).send({
          status: false,
          message: "Modal not found with id " + req.params.modalId
        });
      }
      res.send({ status: true, message: "Modal deleted successfully!" });
    })
    .catch(err => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          status: false,
          message: "Modal not found with id " + req.params.modalId
        });
      }
      return res.status(500).send({
        status: false,
        message: "Could not delete modal with id " + req.params.modalId
      });
    });
};
