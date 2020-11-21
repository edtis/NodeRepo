const Strongs = require("../models/strongs.model.js");
exports.create = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      status: false,
      message: "Strongs can not be empty",
    });
  }
  let userStrongs = new Strongs({ strongs: req.body });
  userStrongs
    .save()
    .then((data) => {
      res.send({
        status: true,
        message: "Strongs created successfully!",
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).send({
        status: false,
        message:
          err.message || "Some error occurred while creating the Strongs.",
      });
    });
};

exports.get = async (req, res) => {
  let { data } = req.body;
  if (Object.keys(data).length === 0) {
    return res.status(400).send({
      strongs: false,
      error: true,
      message: "Data can not be empty",
    });
  }
  Strongs.find()
    .then((response) => {
      let strongsObj = {};
      const len = Object.entries(response[0].strongs).length;
      const keys = Object.keys(response[0].strongs);
      for (let i = 0; i < len; i++) {
        if (keys[i] === data) {
          strongsObj = response[0].strongs[keys[i]];
        }
      }
      res.send({
        strongs: true,
        message: "Fetched strongs successfully!",
        result: strongsObj,
      });
    })
    .catch((err) => {
      res.status(500).send({
        strongs: false,
        message: err.message || "Some error occurred while retrieving strongs.",
      });
    });
};

exports.delete = (req, res) => {
  Strongs.findByIdAndRemove(req.query.strongsId)
    .then((strongs) => {
      if (!strongs) {
        return res.status(404).send({
          status: false,
          message: "Strongs not found with id " + req.query.strongsId,
        });
      }
      res.send({ status: true, message: "Strongs deleted successfully!" });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          status: false,
          message: "Strongs not found with id " + req.query.strongsId,
        });
      }
      return res.status(500).send({
        status: false,
        message: "Could not delete Strongs with id " + req.query.strongsId,
      });
    });
};
