const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
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
db.role.belongsToMany(db.user, {
  through: "user_roles"
});
db.user.belongsToMany(db.role, {
  through: "user_roles"
});

// Définition des associations pour Comment
db.comment.associate = (models) => {
  db.comment.belongsTo(models.user, {
    foreignKey: 'userId',
    as: 'user' // Utilisé pour inclure les données de l'utilisateur
  });
  db.comment.belongsTo(models.articles, {
    foreignKey: 'articleId',
    as: 'article' // Utilisé pour inclure les données de l'article
  });
};

// Définition des associations pour Article
db.articles.associate = (models) => {
  db.articles.hasMany(models.comment, {
    foreignKey: 'articleId',
    as: 'comments' // Utilisé pour récupérer les commentaires d'un article
  });
};

// Définition des associations pour User
db.user.associate = (models) => {
  db.user.hasMany(models.comment, {
    foreignKey: 'userId',
    as: 'comments' // Utilisé pour récupérer les commentaires d'un utilisateur
  });
};

db.ROLES = ["user", "admin", "moderator"];

// Appel des associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
