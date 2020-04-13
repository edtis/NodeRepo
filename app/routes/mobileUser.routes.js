module.exports = app => {
  // Add headers
  app.use(function(req, res, next) {
    // Website you wish to allow to connect
<<<<<<< Updated upstream
    res.setHeader("Access-Control-Allow-Origin", "https://goodbookbible.study");
=======
    res.setHeader("Access-Control-Allow-Origin", ['https://goodbookbible.study']);
>>>>>>> Stashed changes

    // Request methods you wish to allow
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );

    // Request headers you wish to allow
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With,content-type"
    );

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", true);

    // Pass to next layer of middleware
    next();
  });
  const user = require("../controllers/mobileUser.controller.js");

  app.post("/mobile/register", user.create);
  app.post("/mobile/login", user.findOne);
  app.post("/mobile/all", user.all);
  app.post("/mobile/highlight", user.highlight);
  app.post("/mobile/bold", user.bold);
  app.post("/mobile/underline", user.underline);
  app.post("/mobile/referencetags", user.referencetags);
  app.post("/mobile/italic", user.italic);
  app.post("/mobile/favorite", user.favorite);
  app.post("/mobile/notes", user.notes);
};
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
