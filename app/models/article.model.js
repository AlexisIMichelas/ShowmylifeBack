// app/models/article.model.js
module.exports = (sequelize, Sequelize) => {
  const Article = sequelize.define("article", {
      title: {
          type: Sequelize.STRING,
          allowNull: false // Vous pouvez rendre cela obligatoire
      },
      description: {
          type: Sequelize.STRING,
          allowNull: false // Vous pouvez rendre cela obligatoire
      },
      published: {
          type: Sequelize.BOOLEAN,
          defaultValue: false // Par défaut, l'article n'est pas publié
      },
      image: {
          type: Sequelize.STRING,
          allowNull: true // L'image peut être facultative
      }
  });

  

  return Article;
};
