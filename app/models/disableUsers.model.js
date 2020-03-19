const mongoose = require("mongoose");

const DisableUsersSchema = mongoose.Schema({
  isAdmin: Boolean,
  register: Boolean,
  login: Boolean,
  copyRight: String
});

module.exports = mongoose.model("DisableUsers", DisableUsersSchema);
