const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  confirmedEmail: Boolean,
  created: Date,
  lastLogin: Date,
  favs: Object,
  notes: Object,
  bolded: Object,
  underlined: Object,
  italicized: Object,
  highlighted: Object,
  referenceTags: Object
});

module.exports = mongoose.model("User", UserSchema);
