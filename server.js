const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();

// Configurer les options de CORS
var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// Middleware pour parser les requêtes de type application/json
app.use(express.json());

// Middleware pour parser les requêtes de type application/x-www-form-urlencoded
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

// Base de données
const db = require("./app/models");
db.sequelize.sync();

// Route simple pour vérifier que l'application fonctionne
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the application." });
});

// Route pour créer un tutoriel avec upload d'image
const articles = require("./app/controllers/article.controller");
app.post("/api/articles", upload.single("image"), articles.create);

// Inclure d'autres routes pour le CRUD des tutoriels
require("./app/routes/article.routes")(app);

// Définir le port et démarrer le serveur
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
