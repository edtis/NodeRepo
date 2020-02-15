const Website = require("../models/website.model.js");

exports.create = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Website Alert can not be empty"
    });
  }

  let user = new Website(req.body);
  user
    .save()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
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
        message: "Fetched all website successfully!",
        data: data
      });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving website."
      });
    });
};

exports.delete = (req, res) => {
  Website.findByIdAndRemove(req.params.websiteId)
    .then(website => {
      if (!website) {
        return res.status(404).send({
          message: "Website not found with id " + req.params.websiteId
        });
      }
      res.send({ message: "Website deleted successfully!" });
    })
    .catch(err => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "Website not found with id " + req.params.websiteId
        });
      }
      return res.status(500).send({
        message: "Could not delete Website with id " + req.params.websiteId
      });
    });
};
