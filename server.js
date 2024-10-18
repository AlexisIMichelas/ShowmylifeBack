require('dotenv').config();
const express = require("express");
const cors = require("cors");// Assurez-vous que le chemin est correct
const db = require("./app/models");
const bodyParser = require("body-parser");
const app = express();

// Configurer les options de CORS
var corsOptions = {
  credentials: true,
  origin: "*"
};

// Middleware pour les requêtes
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' })); // Définit la taille maximale du corps JSON à 10 Mo
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Synchroniser la base de données
db.sequelize.sync({ alter: true }).then(() => {
  console.log("Database synchronized successfully.");
  initial(); // Initialiser les rôles après la synchronisation
}).catch(err => {
  console.error("Error synchronizing the database: ", err);
});

// Initialiser les rôles
function initial() {
  const Role = db.role; // Importer le modèle Role
  Role.findOrCreate({ where: { id: 1, name: "user" } });
  Role.findOrCreate({ where: { id: 3, name: "admin" } });
}

// Route simple pour vérifier que l'application fonctionne
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the application." });
});

// Routes pour les articles
const articles = require("./app/controllers/article.controller");
// Suppression de l'upload Multer, car nous gérons les images directement via Cloudinary
app.post("/api/articles", articles.create); // Plus besoin de gérer les uploads de fichiers localement
require("./app/routes/article.routes")(app); // Routes d'articles

// Routes pour la gestion des utilisateurs et authentification
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

// Définir le port et démarrer le serveur
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

module.exports = app;
