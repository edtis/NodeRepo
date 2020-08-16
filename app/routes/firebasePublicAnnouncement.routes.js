const allowURL = require("../../config/global.config");
module.exports = app => {
  // Add headers
  app.use(function(req, res, next) {
    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", [allowURL]);

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
  const firebasePublicAnnouncement = require("../controllers/firebasePublicAnnouncement.controller.js");

  app.post(
    "/firebase/create/publicAnnouncement",
    firebasePublicAnnouncement.create
  );
  app.put(
    "/firebase/update/publicAnnouncement",
    firebasePublicAnnouncement.update
  );
  app.post(
    "/firebase/delete/publicAnnouncement",
    firebasePublicAnnouncement.delete
  );
  app.get(
    "/firebase/get/publicAnnouncements",
    firebasePublicAnnouncement.getPublicAnnouncements
  );
};
