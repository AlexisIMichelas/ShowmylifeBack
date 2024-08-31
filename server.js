const express = require("express");
// const bodyParser = require("body-parser"); /* deprecated */
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");
const upload = multer({ dest: "./app/uploads/" });

const app = express();

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// Route POST pour recevoir un fichier
app.post("/api/image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("Aucun fichier n'a été uploadé.");
  }

  // On récupère le nom du fichier
  const { originalname, filename } = req.file;

  // On utilise la fonction rename de fs pour renommer le fichier
  fs.rename(`./app/uploads/${filename}`, `./app/uploads/${uuidv4()}-${originalname}`, (err) => {
    if (err) {
      return res.status(500).send("Erreur lors du renommage du fichier.");
    }
    res.send("Fichier uploadé avec succès.");
  });
});


// Parse requests of content-type - application/json
app.use(express.json());  /* bodyParser.json() is deprecated */

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));   /* bodyParser.urlencoded() is deprecated */

const db = require("./app/models");
db.sequelize.sync();
// // Drop the table if it already exists
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

// Simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

require("./app/routes/tutorial.routes")(app);

// Set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
