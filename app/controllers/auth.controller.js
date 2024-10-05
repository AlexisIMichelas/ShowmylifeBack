const nodemailer = require("nodemailer");
const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Configuration du transporteur pour envoyer les emails via Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL, // Utiliser une variable d'environnement pour l'email
    pass: process.env.PASSWORD, // Utiliser une variable d'environnement pour le mot de passe
  },
});

// Fonction pour envoyer l'email de contact
const sendContactEmail = async (req, res) => {
  const { name, email, message } = req.body;

  // Valider les données reçues
  if (!name || !email || !message) {
    return res.status(400).send({ message: "Tous les champs sont requis." });
  }

  // Options de l'email
  const mailOptions = {
    from: email, // L'email de l'expéditeur
    to: process.env.RECIPIENT_EMAIL, // Destinataire, par exemple, une adresse email d'assistance
    subject: `Nouveau message de ${name}`, // Sujet de l'email
    text: message, // Contenu texte
    html: `<p><strong>Nom:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong> ${message}</p>`, // Contenu HTML
  };

  try {
    // Envoyer l'email
    await transporter.sendMail(mailOptions);
    res.status(200).send({ message: "Email envoyé avec succès!" });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email : ", error);
    res.status(500).send({ message: "Erreur lors de l'envoi de l'email." });
  }
};

// Autres fonctions

const changeEmail = (req, res) => {
  const userId = req.userId;
  const newEmail = req.body.email;

  // Rechercher l'utilisateur et mettre à jour l'email
  User.update({ email: newEmail }, { where: { id: userId } })
    .then(() => {
      res.status(200).send({ message: "Email updated successfully!" });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

const changePassword = (req, res) => {
  const userId = req.userId;
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;

  User.findByPk(userId).then(user => {
    if (!user) {
      return res.status(404).send({ message: "Utilisateur non trouvé!" });
    }

    // Vérifier si le mot de passe actuel est correct
    var passwordIsValid = bcrypt.compareSync(currentPassword, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({ message: "Mot de passe actuel incorrect!" });
    }

    // Mettre à jour le mot de passe
    user.password = bcrypt.hashSync(newPassword, 8);
    user.save().then(() => {
      res.status(200).send({ message: "Mot de passe changé avec succès!" });
    }).catch(err => {
      res.status(500).send({ message: err.message });
    });
  }).catch(err => {
    res.status(500).send({ message: err.message });
  });
};

const signup = (req, res) => {
  // Save User to Database
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  })
    .then(user => {
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles
            }
          }
        }).then(roles => {
          user.setRoles(roles).then(() => {
            res.send({ message: "User registered successfully!" });
          });
        });
      } else {
        // user role = 1
        user.setRoles([1]).then(() => {
          res.send({ message: "User registered successfully!" });
        });
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

const signin = (req, res) => {
  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      const token = jwt.sign({ id: user.id },
                              config.secret,
                              {
                                algorithm: 'HS256',
                                allowInsecureKeySizes: true,
                                expiresIn: 86400, // 24 hours
                              });

      var authorities = [];
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }
        res.status(200).send({
          id: user.id,
          username: user.username,
          email: user.email,
          roles: authorities,
          accessToken: token
        });
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

// Exporter les fonctions du contrôleur
module.exports = {
  sendContactEmail,
  changeEmail,
  changePassword,
  signup,
  signin
};
