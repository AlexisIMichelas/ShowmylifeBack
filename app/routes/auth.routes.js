// auth.routes.js
const { verifySignUp, authJwt } = require("../middleware");
const controller = require("../controllers/auth.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted
    ],
    controller.signup
  );

  app.post("/api/auth/signin", controller.signin);

  app.put("/api/auth/change-email", [authJwt.verifyToken], controller.changeEmail);

  app.put("/api/auth/change-password", [authJwt.verifyToken], controller.changePassword);

  app.post("/api/auth/contact", controller.sendContactEmail);

};
