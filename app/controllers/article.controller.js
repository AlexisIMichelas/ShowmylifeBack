const fs = require('fs');
const db = require("../models");
const Article = db.articles;
const cloudinary = require('../config/cloudinary.config'); // Importer Cloudinary

// Créer et enregistrer un nouvel article
exports.create = async (req, res) => {
  try {
    let imageUrl = null;

    // Vérifier si une image est incluse dans la requête (par exemple sous forme de base64 ou via un chemin)
    if (req.body.image) {
      const result = await cloudinary.uploader.upload(req.body.image, {
        folder: "my_upload_preset"
      });
      imageUrl = result.secure_url; // Récupérer l'URL sécurisée de Cloudinary
    }

    // Créer l'article avec les informations fournies
    const article = {
      title: req.body.title,
      description: req.body.description,
      published: req.body.published ? req.body.published : false,
      image: imageUrl
    };

    // Enregistrer l'article dans la base de données
    const data = await Article.create(article);
    res.status(201).send(data); // Répondre avec l'article créé
  } catch (err) {
    console.error("Erreur lors de la création de l'article:", err);
    res.status(500).send({
      message: "Erreur lors de la création de l'article."
    });
  }
};

exports.update = async (req, res) => {
  const id = req.params.id;

  try {
      // Chercher l'article à mettre à jour
      const articleToUpdate = await Article.findByPk(id);
      if (!articleToUpdate) {
          return res.status(404).send({ message: "Article non trouvé." });
      }

      // Préparer les champs à mettre à jour
      const updatedArticle = {
          title: req.body.title || articleToUpdate.title,
          description: req.body.description || articleToUpdate.description,
          published: req.body.published !== undefined ? req.body.published : articleToUpdate.published,
          image: articleToUpdate.image // Garder l'ancienne image par défaut
      };

      // Si une nouvelle image est fournie, la télécharger sur Cloudinary
      if (req.body.image) {
          try {
              const result = await cloudinary.uploader.upload(req.body.image, {
                  folder: "my_upload_preset"
              });
              console.log("Image uploaded to Cloudinary:", result);
              updatedArticle.image = result.secure_url; // Mettre à jour l'URL de l'image
          } catch (uploadError) {
              console.error("Erreur lors du téléchargement de l'image sur Cloudinary:", uploadError);
              return res.status(400).send({
                  message: "Erreur lors du téléchargement de l'image sur Cloudinary."
              });
          }
      }

      // Mettre à jour l'article dans la base de données
      const [num] = await Article.update(updatedArticle, {
          where: { id: id }
      });

      if (num == 1) {
          // Optionnel : récupérer l'article mis à jour pour confirmation
          const updatedArticleData = await Article.findByPk(id);
          res.send({
              message: "L'article a été mis à jour avec succès.",
              updatedArticle: updatedArticleData // renvoie les nouvelles données
          });
      } else {
          res.send({
              message: `Impossible de mettre à jour l'article avec l'id=${id}. Peut-être que l'article n'a pas été trouvé ou que req.body est vide !`
          });
      }
  } catch (err) {
      console.error("Erreur lors de la mise à jour de l'article:", err);
      res.status(500).send({
          message: "Erreur lors de la mise à jour de l'article avec l'id=" + id
      });
  }
};



// Récupérer tous les articles
exports.findAll = async (req, res) => {
  const title = req.query.title; // Récupérer le titre à partir des paramètres de requête
  const condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

  try {
    const articles = await Article.findAll({ where: condition });
    res.send(articles); // Répondre avec la liste des articles
  } catch (err) {
    res.status(500).send({
      message: err.message || "Une erreur est survenue lors de la récupération des articles."
    });
  }
};

// Récupérer un article par ID
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const article = await Article.findByPk(id);
    if (article) {
      res.send(article); // Répondre avec l'article trouvé
    } else {
      res.status(404).send({ message: `Article avec id=${id} n'a pas été trouvé.` });
    }
  } catch (err) {
    res.status(500).send({
      message: "Erreur lors de la récupération de l'article avec id=" + id
    });
  }
};

// Supprimer un article par l'ID
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Article.destroy({ where: { id: id } });
    if (num == 1) {
      res.send({ message: "L'article a été supprimé avec succès." });
    } else {
      res.send({ message: `Impossible de supprimer l'article avec l'id=${id}. Peut-être que l'article n'a pas été trouvé.` });
    }
  } catch (err) {
    res.status(500).send({
      message: "Erreur lors de la suppression de l'article avec l'id=" + id
    });
  }
};

// Supprimer tous les articles
exports.deleteAll = async (req, res) => {
  try {
    const nums = await Article.destroy({ where: {}, truncate: true });
    res.send({ message: `${nums} articles ont été supprimés avec succès !` });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Une erreur est survenue lors de la suppression de tous les articles."
    });
  }
};
