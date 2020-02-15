const mongoose = require("mongoose");

const DisableUsersSchema = mongoose.Schema({
  isAdmin: Boolean,
  register: Boolean,
  login: Boolean
});

module.exports = mongoose.model("DisableUsers", DisableUsersSchema);
