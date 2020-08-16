const database = require("../../config/firebase.config");
var PublicAnnouncementsRef = database.ref("publicAnnouncements");

exports.create = async (req, res) => {
  var data = req.body;
  if (Object.keys(data).length === 0) {
    return res.status(400).send({
      status: false,
      message: "Public announcements can not be empty"
    });
  }
  PublicAnnouncementsRef.push(data, function(err) {
    if (err) {
      res.send({
        status: false,
        message: "Somthing went wrong",
        error: err
      });
    } else {
      res.json({
        status: true,
        message: "Public announcements added successfully!",
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
  PublicAnnouncementsRef.child(uid).update(data, function(err) {
    if (err) {
      res.send({
        status: false,
        message: "Somthing went wrong",
        error: err
      });
    } else {
      res.json({
        status: true,
        message: "Public announcements updated successfully!",
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
      message: "Public announcements id can not be empty"
    });
  }
  PublicAnnouncementsRef.child(uid).remove(function(err) {
    if (err) {
      res.send({
        status: false,
        message: "Somthing went wrong",
        error: err
      });
    } else {
      res.json({
        status: true,
        message: "Public announcements deleted successfully!"
      });
    }
  });
};

exports.getPublicAnnouncements = async (req, res) => {
  PublicAnnouncementsRef.once("value", function(snapshot) {
    if (snapshot.val() === null) {
      res.json({
        status: false,
        message: "No user found!"
      });
    } else {
      res.json({
        status: true,
        message: "Public announcements fetched successfully!",
        data: snapshot.val()
      });
    }
  });
};
