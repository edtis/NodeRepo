const allowURL = require("../../config/global.config");
module.exports = (app) => {
  // Add headers
  app.use(function (req, res, next) {
    // Website you wish to allow to connect
    const origin = req.headers.origin;
    if (allowURL.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }

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
  const broadcast = require("../controllers/broadcast.controller.js");

  app.post("/broadcast/create", broadcast.create);
  app.get("/broadcasts", broadcast.findAll);
  app.delete("/broadcast/delete/:broadcastId", broadcast.delete);
};
