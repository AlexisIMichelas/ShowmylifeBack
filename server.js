require('dotenv').config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require('./app/config/cloudinary.config'); // Assurez-vous que le chemin est correct
const db = require("./app/models");
const app = express();

// Configurer les options de CORS
const corsOptions = {
  credentials: true,
  origin: "*"
};

// Middleware pour les requêtes
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir des fichiers statiques à partir du répertoire 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'app/uploads')));

// Configurer Multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './app/uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});
const upload = multer({ storage });

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
app.post("/api/articles", upload.single("image"), articles.create); // Gérer l'upload d'images avec multer
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
