const db = require("../models");
const Tutorial = db.tutorials;
const Op = db.Sequelize.Op;
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Créez un stockage Multer personnalisé pour les fichiers
const multer = require('multer');
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

// Créez et enregistrez un nouveau tutoriel
exports.create = (req, res) => {
  // Valider la requête
  if (!req.body.title) {
    return res.status(400).send({
      message: "Le titre ne peut pas être vide!"
    });
  }

  // Créez un tutoriel
  const tutorial = {
    title: req.body.title,
    description: req.body.description,
    published: req.body.published ? req.body.published : false,
    image: req.file ? req.file.filename : null // Utilisez le nom du fichier enregistré par multer
  };

  // Enregistrez le tutoriel dans la base de données
  Tutorial.create(tutorial)
    .then(data => {
      res.status(201).send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Une erreur est survenue lors de la création du tutoriel."
      });
    });
};

// Récupérer tous les tutoriels de la base de données
exports.findAll = (req, res) => {
  const title = req.query.title;
  var condition = title ? { title: { [Op.iLike]: `%${title}%` } } : null;

  Tutorial.findAll({ where: condition })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Une erreur est survenue lors de la récupération des tutoriels."
      });
    });
};

// Trouver un seul tutoriel avec un id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Tutorial.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Impossible de trouver le tutoriel avec l'id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Erreur lors de la récupération du tutoriel avec l'id=" + id
      });
    });
};

// Mettre à jour un tutoriel par l'id dans la requête
exports.update = (req, res) => {
  const id = req.params.id;

  Tutorial.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Le tutoriel a été mis à jour avec succès."
        });
      } else {
        res.send({
          message: `Impossible de mettre à jour le tutoriel avec l'id=${id}. Peut-être que le tutoriel n'a pas été trouvé ou que req.body est vide !`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Erreur lors de la mise à jour du tutoriel avec l'id=" + id
      });
    });
};

// Supprimer un tutoriel avec l'id spécifié dans la requête
exports.delete = (req, res) => {
  const id = req.params.id;

  Tutorial.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Le tutoriel a été supprimé avec succès !"
        });
      } else {
        res.send({
          message: `Impossible de supprimer le tutoriel avec l'id=${id}. Peut-être que le tutoriel n'a pas été trouvé !`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Impossible de supprimer le tutoriel avec l'id=" + id
      });
    });
};

// Supprimer tous les tutoriels de la base de données
exports.deleteAll = (req, res) => {
  Tutorial.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} tutoriels ont été supprimés avec succès !` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Une erreur est survenue lors de la suppression de tous les tutoriels."
      });
    });
};

// Trouver tous les tutoriels publiés
exports.findAllPublished = (req, res) => {
  Tutorial.findAll({ where: { published: true } })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Une erreur est survenue lors de la récupération des tutoriels publiés."
      });
    });
};
