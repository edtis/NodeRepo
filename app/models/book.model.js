const mongoose = require("mongoose");

const BookSchema = mongoose.Schema({
  book: { type: String, required: true, unique: true },
  chapters: [
    {
      chapter: String,
      verses: [
        {
          verse: String,
          text: String
        }
      ]
    }
  ]
});

module.exports = mongoose.model("Book", BookSchema);
