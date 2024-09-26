const db = require("../models");
const Article = db.articles;
const Op = db.Sequelize.Op;
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

// Créez et enregistrez un nouveau article
exports.create = (req, res) => {
  if (!req.body.title) {
    return res.status(400).send({
      message: "Le titre ne peut pas être vide!"
    });
  }

  const article = {
    title: req.body.title,
    description: req.body.description,
    published: req.body.published ? req.body.published : false,
    image: req.file ? req.file.filename : null
  };

  Article.create(article)
    .then(data => {
      res.status(201).send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Une erreur est survenue lors de la création de l'article."
      });
    });
};

// Récupérer tous les articles
exports.findAll = (req, res) => {
  const title = req.query.title;
  var condition = title ? { title: { [Op.iLike]: `%${title}%` } } : null;

  Article.findAll({ where: condition })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Une erreur est survenue lors de la récupération des articles."
      });
    });
};

// Trouver un article avec un id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Article.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Impossible de trouver l'article avec l'id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Erreur lors de la récupération de l'article avec l'id=" + id
      });
    });
};

// Mettre à jour un article par l'id dans la requête
exports.update = (req, res) => {
  const id = req.params.id;

  if (!req.body.title) {
    return res.status(400).send({
      message: "Le titre ne peut pas être vide!"
    });
  }

  const updatedArticle = {
    title: req.body.title,
    description: req.body.description,
    published: req.body.published ? req.body.published : false,
    image: req.file ? req.file.filename : null // Pour gérer l'image
  };

  Article.update(updatedArticle, {
    where: { id: id }
  })
  .then(num => {
    if (num == 1) {
      res.send({
        message: "L'article a été mis à jour avec succès."
      });
    } else {
      res.send({
        message: `Impossible de mettre à jour l'article avec l'id=${id}. Peut-être que l'article n'a pas été trouvé ou que req.body est vide !`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Erreur lors de la mise à jour de l'article avec l'id=" + id
    });
  });
};

// Supprimer un article avec l'id spécifié
exports.delete = (req, res) => {
  const id = req.params.id;

  Article.destroy({
    where: { id: id }
  })
  .then(num => {
    if (num == 1) {
      res.send({
        message: "L'article a été supprimé avec succès !"
      });
    } else {
      res.send({
        message: `Impossible de supprimer l'article avec l'id=${id}. Peut-être que l'article n'a pas été trouvé !`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Impossible de supprimer l'article avec l'id=" + id
    });
  });
};

// Supprimer tous les articles
exports.deleteAll = (req, res) => {
  Article.destroy({
    where: {},
    truncate: false
  })
  .then(nums => {
    res.send({ message: `${nums} articles ont été supprimés avec succès !` });
  })
  .catch(err => {
    res.status(500).send({
      message: err.message || "Une erreur est survenue lors de la suppression de tous les articles."
    });
  });
};

// Trouver tous les articles publiés
exports.findAllPublished = (req, res) => {
  Article.findAll({ where: { published: true } })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Une erreur est survenue lors de la récupération des articles publiés."
      });
    });
};
