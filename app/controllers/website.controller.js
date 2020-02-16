const Website = require("../models/website.model.js");

exports.create = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      status: false,
      message: "Website Alert can not be empty"
    });
  }

  let user = new Website(req.body);
  user
    .save()
    .then(data => {
      res.send({
        status: true,
        message: "Website alert created successfully!",
        data: data
      });
    })
    .catch(err => {
      res.status(500).send({
        status: false,
        message:
          err.message || "Some error occurred while creating the website alert."
      });
    });
};

exports.findAll = (req, res) => {
  Website.find()
    .then(data => {
      res.send({
        status: true,
        message: "Fetched all website alert successfully!",
        data: data
      });
    })
    .catch(err => {
      res.status(500).send({
        status: false,
        message:
          err.message || "Some error occurred while retrieving website alert."
      });
    });
};

exports.delete = (req, res) => {
  Website.findByIdAndRemove(req.params.websiteId)
    .then(website => {
      if (!website) {
        return res.status(404).send({
          status: false,
          message: "Website alert not found with id " + req.params.websiteId
        });
      }
      res.send({
        status: true,
        message: "Website alert deleted successfully!"
      });
    })
    .catch(err => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          status: false,
          message: "Website alert not found with id " + req.params.websiteId
        });
      }
      return res.status(500).send({
        status: false,
        message:
          "Could not delete website alert with id " + req.params.websiteId
      });
    });
};
