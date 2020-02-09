module.exports = app => {
  const user = require("../controllers/user.controller.js");

  // Create a new User
  app.post("/user", user.create);
  app.post("/login", user.findOne);
  app.get("/users", user.findAll);
};
