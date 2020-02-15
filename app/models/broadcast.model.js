const mongoose = require("mongoose");

const BroadcastSchema = mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  subject: { type: String, required: true },
  message: String,
  info: String,
  background: String,
  color: String,
  date: Date
});

module.exports = mongoose.model("Broadcast", BroadcastSchema);
