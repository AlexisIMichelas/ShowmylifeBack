const controller = require("../controllers/user.controller"); // Assurez-vous que le contrôleur est correctement importé

module.exports = function(app) {
  // Middleware pour gérer les CORS
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  // Route pour récupérer tous les utilisateurs
  app.get("/api/users", controller.findAll);

  // Route pour récupérer un utilisateur par ID
  app.get("/api/users/:id", controller.findOne);

  // Route pour mettre à jour un utilisateur par ID
  app.put("/api/users/:id", controller.update);

  // Route pour supprimer un utilisateur par ID
  app.delete("/api/users/:id", controller.delete);

  // Route pour supprimer tous les utilisateurs
  app.delete("/api/users", controller.deleteAll);
};
