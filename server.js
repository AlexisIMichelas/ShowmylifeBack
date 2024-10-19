require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./app/models");

const app = express();

var corsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};
  

app.use(cors(corsOptions));

// Middleware pour parser les requêtes de type application/json
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Synchroniser la base de données
db.sequelize.sync({ force: true }).then(() => {
  console.log("Toutes les tables ont été recréées.");
  
  // Initialiser les rôles après la synchronisation
  initial();
  
}).catch(err => {
  console.error("Erreur lors de la synchronisation de la base de données : ", err);
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
// Supprimer l'upload Multer car on utilise Cloudinary
app.post("/api/articles", articles.create);
require("./app/routes/article.routes")(app);

// Routes pour la gestion des utilisateurs et authentification
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

// Définir le port et démarrer le serveur
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

module.exports = app;
