const express = require("express");
const bodyParser = require("body-parser");

// create express app
const app = express();

// parse requests of content-type - application/x-www-form-urlencoded

app.use(
  bodyParser.urlencoded({
    limit: "150mb",
    parameterLimit: 10000000,
    extended: true,
  })
);

// parse requests of content-type - application/json
app.use(
  bodyParser.json({ limit: "150mb", parameterLimit: 10000000, extended: true })
);

// Configuring the database
const dbConfig = require("./config/database.config.js");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose
  .connect(dbConfig.url, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch((err) => {
    console.log("Could not connect to the database. Exiting now...", err);
    process.exit();
  });

// define a simple route
app.get("/", (req, res) => {
  res.json({ message: "Project is running" });
});

require("./app/routes/user.routes.js")(app);
require("./app/routes/broadcast.routes.js")(app);
require("./app/routes/modal.routes.js")(app);
require("./app/routes/website.routes.js")(app);
require("./app/routes/mobileUser.routes.js")(app);
require("./app/routes/firebaseUser.routes.js")(app);
require("./app/routes/firebaseBook.routes.js")(app);
require("./app/routes/firebaseAdmin.routes.js")(app);
require("./app/routes/firebasePublicAnnouncement.routes.js")(app);
require("./app/routes/interlinear.routes.js")(app);
require("./app/routes/strongs.routes.js")(app);
// listen for requests
app.listen(80, () => {
  console.log("Server is listening on port 80");
});
