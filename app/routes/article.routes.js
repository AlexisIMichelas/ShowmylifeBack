const path = require('path'); // Assurez-vous que le module path est importé
const { v4: uuidv4 } = require('uuid'); // Assurez-vous que uuidv4 est importé

module.exports = app => {
  const articles = require("../controllers/article.controller.js");
  const multer = require('multer'); // Importer multer pour la gestion des fichiers

  var router = require("express").Router();

  // Configuration du stockage pour multer
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './app/uploads/'); // Chemin vers le dossier uploads
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname); // Récupérer l'extension du fichier
      cb(null, `${uuidv4()}${ext}`); // Générer un nom de fichier unique
    }
  });
  
  const upload = multer({ storage }); // Initialiser multer avec le stockage configuré

  // Create a new Article
  router.post("/", upload.single('image'), articles.create);

  // Retrieve all Articles
  router.get("/", articles.findAll);

  // Retrieve a single Article with id
  router.get("/:id", articles.findOne);

  // Update an Article with id
  router.put("/:id", upload.single('image'), articles.update); // Utiliser multer pour mettre à jour

  // Delete an Article
  router.delete("/:id", articles.delete);

  // Delete all Articles
  router.delete("/", articles.deleteAll);

  app.use("/api/articles", router);
};
