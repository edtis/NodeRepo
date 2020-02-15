const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  created: Date,
  lastLogin: Date,
  favs: Object,
  notes: Object,
  Bolded: Object,
  Underlined: Object,
  italicized: Object,
  hightlighted: Object,
  referenceTags: Object
});

module.exports = mongoose.model("User", UserSchema);
