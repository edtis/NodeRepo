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
  const user = require("../controllers/user.controller.js");

  app.post("/user", user.create);
  app.post("/login", user.findOne);
  app.get("/user/:userId", user.findOneById);
  app.get("/users", user.findAll);
  app.put("/user/:userId", user.update);
  app.put("/disable/users", user.disableUsersUpdate);
  app.get("/users/status", user.usersStatus);
  app.delete("/user/:userId", user.delete);
  app.get("/verify", user.verify);
  app.post("/password/reset", user.resetPassword);
  app.get("/verify/reset/password", user.verifyResetPassword);
};
