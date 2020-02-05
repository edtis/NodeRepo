const Book = require("../models/book.model.js");

// Create and Save a new Book
exports.create = (req, res) => {
  if (!req.body.chapters) {
    return res.status(400).send({
      message: "Book content can not be empty"
    });
  }

  // Create a Book
  const book = new Book({
    book: req.body.book || "Untitled Book",
    chapters: [
      {
        chapter: req.body.chapter,
        verses: [
          {
            verse: req.body.verse,
            text: req.body.text
          }
        ]
      }
    ]
  });

  // Save Book in the database
  book
    .save()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Book."
      });
    });
};

// Retrieve and return all books from the database.
exports.findAll = (req, res) => {
  Book.find()
    .then(books => {
      res.send(books);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving books."
      });
    });
};

// Find a single book with a bookId
exports.findOne = (req, res) => {
  Book.findById(req.params.bookId)
    .then(book => {
      if (!book) {
        return res.status(404).send({
          message: "Book not found with id " + req.params.bookId
        });
      }
      res.send(book);
    })
    .catch(err => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "Book not found with id " + req.params.bookId
        });
      }
      return res.status(500).send({
        message: "Error retrieving book with id " + req.params.bookId
      });
    });
};

// Update a book identified by the bookId in the request
exports.update = (req, res) => {
  if (!req.body.chapters) {
    return res.status(400).send({
      message: "Book content can not be empty"
    });
  }

  // Find book and update it with the request body
  Book.findByIdAndUpdate(
    req.params.bookId,
    {
      book: req.body.book || "Untitled Book",
      chapters: [
        {
          chapter: req.body.chapter,
          verses: [
            {
              verse: req.body.verse,
              text: req.body.text
            }
          ]
        }
      ]
    },
    { new: true }
  )
    .then(book => {
      if (!book) {
        return res.status(404).send({
          message: "Book not found with id " + req.params.bookId
        });
      }
      res.send(book);
    })
    .catch(err => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "Book not found with id " + req.params.bookId
        });
      }
      return res.status(500).send({
        message: "Error updating book with id " + req.params.bookId
      });
    });
};

// Delete a book with the specified bookId in the request
exports.delete = (req, res) => {
  Book.findByIdAndRemove(req.params.bookId)
    .then(book => {
      if (!book) {
        return res.status(404).send({
          message: "Book not found with id " + req.params.bookId
        });
      }
      res.send({ message: "Book deleted successfully!" });
    })
    .catch(err => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "Book not found with id " + req.params.bookId
        });
      }
      return res.status(500).send({
        message: "Could not delete book with id " + req.params.bookId
      });
    });
};
