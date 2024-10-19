require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./app/models");

const app = express();

var corsOptions = {
  origin: '*', // Autoriser toutes les origines
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes autorisées
  allowedHeaders: ['Content-Type', 'Authorization'], // En-têtes autorisés
};

app.use(cors(corsOptions));

// Middleware pour parser les requêtes de type application/json
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Synchroniser la base de données
async function init_db() {
  try {
    await db.sequelize.sync({ alter: true });
    
    // Initialiser les rôles
    const Role = db.role;
    await Role.findOrCreate({ where: { id: 1, name: "user" } });
    await Role.findOrCreate({ where: { id: 3, name: "admin" } });

    console.log("Database initialized");
  } catch (err) {
    console.error('Error initializing database: ', err);
    throw err;
  }
}

// Route simple pour vérifier que l'application fonctionne
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the application." });
});

app.get("/initdb", async (req, res) => {
  try {
    await init_db();
    res.status(200).json({ message: "Database initialized successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error initializing database", error });
  }
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
  
  // Initialiser la base de données
  init_db(); // Appel à la fonction d'initialisation
});

module.exports = app;
