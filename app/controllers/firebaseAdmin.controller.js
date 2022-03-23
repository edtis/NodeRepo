var admin = require("firebase-admin");
exports.delete = async (req, res) => {
  var data = req.body;
  const uid = data.id;
  if (!uid) {
    return res.status(400).send({
      status: false,
      message: "User id can not be empty",
    });
  }
  admin
    .auth()
    .deleteUser(uid)
    .then(() => {
      return res.status(200).send({
        status: true,
        message: "Successfully deleted user",
      });
    })
    .catch((error) => {
      return res.status(500).send({
        status: false,
        message: "Error deleting user",
      });
    });
};
