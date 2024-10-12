const express = require("express");
const controller = require("../controllers/comment.controller"); // Vérifiez que le chemin est correct

const router = express.Router(); // Créer un routeur

// Middleware pour gérer les CORS
router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
  next();
});

// Route pour récupérer tous les commentaires d'un article
router.get("/articles/:id/comments", controller.findByArticleId); // Notez l'utilisation de findByArticleId

// Route pour créer un nouveau commentaire
router.post("/articles/:id/comments", controller.create);

module.exports = router; // Exporter le routeur
