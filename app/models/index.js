const Sequelize = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  dialectModule: require('pg'),  // Spécifier explicitement le module pg
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false  // Nécessaire si SSL est requis mais sans vérification stricte des certificats
    }
  },
  pool: {
    max: 5,            // Nombre maximum de connexions simultanées
    min: 0,            // Nombre minimum de connexions à maintenir ouvertes
    acquire: 30000,    // Délai maximal pour établir une connexion
    idle: 10000        // Durée avant qu'une connexion inactive soit fermée
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importation des modèles
db.articles = require("./article.model.js")(sequelize, Sequelize);
db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.comment = require("../models/comment.model.js")(sequelize, Sequelize);

// Définir les associations
db.role.belongsToMany(db.user, { through: "user_roles" });
db.user.belongsToMany(db.role, { through: "user_roles" });

db.comment.belongsTo(db.user, { foreignKey: 'userId', as: 'user' });
db.comment.belongsTo(db.articles, { foreignKey: 'articleId', as: 'article' });

db.articles.hasMany(db.comment, { foreignKey: 'articleId', as: 'comments' });
db.user.hasMany(db.comment, { foreignKey: 'userId', as: 'comments' });

db.ROLES = ["user", "admin", "moderator"];

// Appel des associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;