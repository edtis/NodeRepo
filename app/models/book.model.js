const mongoose = require("mongoose");

const BookSchema = mongoose.Schema(
  {
    book: String,
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
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Book", BookSchema);
