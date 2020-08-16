const database = require("../../config/firebase.config");
var BookRef = database.ref("books");

exports.create = async (req, res) => {
  var data = req.body;
  if (Object.keys(data).length === 0) {
    return res.status(400).send({
      status: false,
      message: "Book can not be empty"
    });
  }
  BookRef.push(data, function(err) {
    if (err) {
      res.send({
        status: false,
        message: "Somthing went wrong",
        error: err
      });
    } else {
      res.json({
        status: true,
        message: "Book added successfully!",
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
      message: "Book can not be empty"
    });
  }
  const records = {};
  if (data.commentArray) {
    records.comments = data.commentArray || [];
  } else {
    records.likes = data.likeArray || [];
  }
  BookRef.child(data.book).update(records, function(err) {
    if (err) {
      res.send({
        status: false,
        message: "Somthing went wrong",
        error: err
      });
    } else {
      res.json({
        status: true,
        message: "Book updated successfully!",
        data
      });
    }
  });
};

exports.delete = async (req, res) => {
  var bid = "-MElBgapoEvEumMIKAMQ";
  if (!bid) {
    return res.status(400).send({
      status: false,
      message: "Book id can not be empty"
    });
  }
  BookRef.child(bid).remove(function(err) {
    if (err) {
      res.send({
        status: false,
        message: "Somthing went wrong",
        error: err
      });
    } else {
      res.json({
        status: true,
        message: "Book deleted successfully!"
      });
    }
  });
};

exports.getbooks = async (req, res) => {
  BookRef.once("value", function(snapshot) {
    if (snapshot.val() === null) {
      res.json({
        status: false,
        message: "No book found"
      });
    } else {
      res.json({
        status: true,
        message: "Books fetched successfully!",
        data: snapshot.val()
      });
    }
  });
};
