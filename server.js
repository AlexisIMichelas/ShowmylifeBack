require('dotenv').config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();

// Configurer les options de CORS
var corsOptions = {
  credentials: true,
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
const Role = db.role;

// Synchroniser la base de données
db.sequelize.sync().then(() => {
  console.log('Database synchronized.');
  initial();
});

// Initialiser les rôles
function initial() {
  Role.findOrCreate({ where: { id: 1, name: "user" } });
  Role.findOrCreate({ where: { id: 3, name: "admin" } });
}

// Route simple pour vérifier que l'application fonctionne
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the application." });
});

// Routes pour les articles
const articles = require("./app/controllers/article.controller");
app.post("/api/articles", upload.single("image"), articles.create);
require("./app/routes/article.routes")(app);

const commentRoutes = require("./app/routes/comment.routes");
app.use("/api", commentRoutes)

// Routes pour la gestion des utilisateurs et authentification
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

// Définir le port et démarrer le serveur
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
