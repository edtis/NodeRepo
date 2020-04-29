module.exports = app => {
  // Add headers
  app.use(function(req, res, next) {
    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", [
      "https://goodbookbible.study"
    ]);

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

  // old paths
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

  // new paths

  app.post("/mobile/highlight/update", user.highlightUpdate);
  app.post("/mobile/bold/update", user.boldUpdate);
  app.post("/mobile/underline/update", user.underlineUpdate);
  app.post("/mobile/referencetags/update", user.referencetagsUpdate);
  app.post("/mobile/italic/update", user.italicUpdate);
  app.post("/mobile/favorite/update", user.favoriteUpdate);
  app.post("/mobile/notes/update", user.notesUpdate);
};
