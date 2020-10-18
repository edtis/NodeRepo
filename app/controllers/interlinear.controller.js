const Interlinear = require("../models/interlinear.model.js");
exports.create = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      status: false,
      message: "Interlinear Alert can not be empty",
    });
  }
  let userInterlinear = new Interlinear({ interlinear: req.body });
  userInterlinear
    .save()
    .then((data) => {
      res.send({
        status: true,
        message: "Interlinear created successfully!",
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).send({
        status: false,
        message:
          err.message ||
          "Some error occurred while creating the interlinear alert.",
      });
    });
};

exports.get = async (req, res) => {
  let { data } = req.body;
  if (Object.keys(data).length === 0) {
    return res.status(400).send({
      interlinear: false,
      error: true,
      message: "Book can not be empty",
    });
  }
  Interlinear.find()
    .then((response) => {
      let interlinearObj = [];
      const book = data[0].book.toLowerCase().replace(/\s/g, "");
      const chapter = data[0].chapter;
      const verse = data[0].verse;
      for (let i = 0; i < response.length; i++) {
        const interlinearData = response[i].interlinear;
        for (let j = 0; j < interlinearData.length; j++) {
          const interlinearBook = interlinearData[j].book
            .toLowerCase()
            .replace(/\s/g, "");
          if (interlinearBook === book) {
            const interlinearChapter = interlinearData[j].chapters;
            for (let k = 0; k < interlinearChapter.length; k++) {
              if (chapter === interlinearChapter[k].chapter) {
                const interlinearVerses = interlinearChapter[k].verses;
                for (let l = 0; l < interlinearVerses.length; l++) {
                  if (verse === interlinearVerses[l].verse) {
                    interlinearObj = interlinearVerses[l];
                  }
                }
              }
            }
          }
        }
      }
      res.send({
        interlinear: true,
        message: "Fetched interlinear successfully!",
        data: {
          book: data[0].book,
          chapter: chapter,
          verse: interlinearObj,
        },
      });
    })
    .catch((err) => {
      res.status(500).send({
        interlinear: false,
        message:
          err.message || "Some error occurred while retrieving interlinear.",
      });
    });
};

exports.delete = (req, res) => {
  Interlinear.findByIdAndRemove(req.query.interlinearId)
    .then((interlinear) => {
      if (!interlinear) {
        return res.status(404).send({
          status: false,
          message: "Interlinear not found with id " + req.query.interlinearId,
        });
      }
      res.send({ status: true, message: "Interlinear deleted successfully!" });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          status: false,
          message: "Interlinear not found with id " + req.query.interlinearId,
        });
      }
      return res.status(500).send({
        status: false,
        message:
          "Could not delete Interlinear with id " + req.query.interlinearId,
      });
    });
};
