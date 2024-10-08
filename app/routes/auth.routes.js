const { authJwt, verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");

module.exports = function(app) {
  // Middleware pour gérer les CORS
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Route pour l'inscription
  app.post(
    "/api/auth/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted
    ],
    controller.signup
  );

  // Route pour la connexion
  app.post("/api/auth/signin", controller.signin);

  // Route pour changer l'email
  app.put("/api/auth/change-email", [authJwt.verifyToken], controller.changeEmail);

  // Route pour changer le mot de passe
  app.put("/api/auth/change-password", [authJwt.verifyToken], controller.changePassword);

  // Route pour envoyer l'email  
  app.post("/api/auth/request-password-reset", controller.requestPasswordReset);

  // Route pour réinitialiser le mot de passe
  app.put('/api/auth/resetpassword', controller.resetPassword);
};
