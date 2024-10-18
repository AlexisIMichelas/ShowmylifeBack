require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./app/models");

const app = express();

// Configurer les options de CORS
const corsOptions = {
  credentials: true,
  origin: "*"
};

app.use(cors(corsOptions));

// Middleware pour parser les requêtes de type application/json
app.use(bodyParser.json({ limit: '10mb' }));
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
