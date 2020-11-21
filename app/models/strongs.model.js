const mongoose = require("mongoose");

const StrongsSchema = mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  strongs: Object,
});

module.exports = mongoose.model("Strongs", StrongsSchema);
