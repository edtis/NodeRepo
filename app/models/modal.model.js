const mongoose = require("mongoose");

const ModalSchema = mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  subject: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  date: Date
});

module.exports = mongoose.model("Modal", ModalSchema);
