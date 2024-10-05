const nodemailer = require("nodemailer");

// Configuration du transporteur pour envoyer les emails via Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL, // Utiliser une variable d'environnement pour l'email
    pass: process.env.PASSWORD, // Utiliser une variable d'environnement pour le mot de passe
  },
});

// Exporter le transporteur pour l'utiliser dans d'autres fichiers
exports.transporter = transporter;

// Fonction pour envoyer l'email de réinitialisation
exports.sendPasswordResetEmail = async (toEmail, resetToken) => {
  // (Le code existant pour envoyer l'email de réinitialisation)
};
