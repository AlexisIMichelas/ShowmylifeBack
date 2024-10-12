// models/comment.js
module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define('comment', {
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });
  
    return Comment;
  };
  