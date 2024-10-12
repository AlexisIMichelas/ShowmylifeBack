const db = require("../models");
const Comment = db.comment;
const User = db.user;

// Récupérer tous les commentaires d'un article par son ID
exports.findByArticleId = (req, res) => {
    const articleId = req.params.id;
  
    Comment.findAll({
      where: { articleId: articleId },
      include: [{ model: User, as: 'user', attributes: ['username'] }] // Inclus l'utilisateur
    })
      .then(data => {
        const commentsWithUsernames = data.map(comment => ({
          id: comment.id,
          content: comment.content,
          userId: comment.userId,
          articleId: comment.articleId,
          createdAt: comment.createdAt,
          userName: comment.user.username // Nom d'utilisateur
        }));
  
        res.send(commentsWithUsernames);
      })
      .catch(err => {
        res.status(500).send({
          message: err.message || "Une erreur est survenue lors de la récupération des commentaires."
        });
      });
  };

// Créer un nouveau commentaire
exports.create = (req, res) => {
  // Vérifie que le contenu du commentaire n'est pas vide
  if (!req.body.content) {
    return res.status(400).send({
      message: "Le contenu du commentaire ne peut pas être vide !"
    });
  }

  // Crée un nouvel objet de commentaire
  const comment = {
    userId: req.body.userId, // ID de l'utilisateur
    articleId: req.body.articleId, // ID de l'article
    content: req.body.content, // Contenu du commentaire
    createdAt: new Date() // Date de création du commentaire
  };

  // Crée le commentaire dans la base de données
  Comment.create(comment)
    .then(data => {
      // Récupère l'utilisateur associé à ce commentaire pour obtenir le nom d'utilisateur
      return User.findByPk(req.body.userId).then(user => {
        if (user) {
          data.userName = user.username; // Ajoute le nom d'utilisateur au commentaire
        }
        res.status(201).send(data); // Renvoie le commentaire créé
      });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Une erreur est survenue lors de la création du commentaire."
      });
    });
};
