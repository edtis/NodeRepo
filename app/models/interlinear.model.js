const mongoose = require("mongoose");

const InterlinearSchema = mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  interlinear: Object,
});

module.exports = mongoose.model("Interlinear", InterlinearSchema);
