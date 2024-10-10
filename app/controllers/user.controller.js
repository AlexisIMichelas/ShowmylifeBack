const db = require("../models");
const User = db.user; // Assurez-vous que votre modèle d'utilisateur est correctement importé
const Role = db.role; // Importation du modèle de rôle

// Récupérer tous les utilisateurs
exports.findAll = (req, res) => {
  User.findAll({
    attributes: ['id', 'username', 'email'], // Sélectionner les attributs que vous souhaitez afficher
    include: [{
      model: Role,
      attributes: ['name'],
      through: { attributes: [] } // Ne pas afficher les attributs de la table d'association
    }]
  })
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message: err.message || "Une erreur est survenue lors de la récupération des utilisateurs."
    });
  });
};

// Récupérer un utilisateur par ID
exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findByPk(id, {
    attributes: ['id', 'username', 'email'], // Sélectionner les attributs que vous souhaitez afficher
    include: [{
      model: Role,
      attributes: ['name'],
      through: { attributes: [] }
    }]
  })
  .then(user => {
    if (!user) {
      return res.status(404).send({ message: "Utilisateur non trouvé." });
    }
    res.send(user);
  })
  .catch(err => {
    res.status(500).send({
      message: err.message || "Une erreur est survenue lors de la récupération de l'utilisateur."
    });
  });
};


// Mettre à jour un utilisateur par ID
exports.update = (req, res) => {
  const id = req.params.id;

  User.update(req.body, {
    where: { id: id }
  })
  .then(num => {
    if (num == 1) {
      res.send({ message: "Utilisateur mis à jour avec succès." });
    } else {
      res.send({ message: `Impossible de mettre à jour l'utilisateur avec l'id=${id}. Peut-être que l'utilisateur n'a pas été trouvé!` });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Erreur lors de la mise à jour de l'utilisateur avec l'id=" + id
    });
  });
};

// Supprimer un utilisateur avec l'id spécifié
exports.delete = (req, res) => {
  const id = req.params.id;

  User.destroy({
    where: { id: id }
  })
  .then(num => {
    if (num === 1) {
      res.send({ message: "L'utilisateur a été supprimé avec succès!" });
    } else {
      res.send({ message: `Impossible de supprimer l'utilisateur avec l'id=${id}. Peut-être que l'utilisateur n'a pas été trouvé!` });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Impossible de supprimer l'utilisateur avec l'id=" + id
    });
  });
};

// Supprimer tous les utilisateurs
exports.deleteAll = (req, res) => {
  User.destroy({
    where: {},
    truncate: false // Supprime tous les enregistrements sans condition
  })
  .then(nums => {
    res.send({ message: `${nums} utilisateurs ont été supprimés avec succès!` });
  })
  .catch(err => {
    res.status(500).send({
      message: err.message || "Une erreur est survenue lors de la suppression des utilisateurs."
    });
  });
};
