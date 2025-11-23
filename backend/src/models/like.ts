import { DataTypes, Model} from 'sequelize';
import Database from '../database';

const sequelize = Database.getSequelize();

export class Like extends Model {
  declare userId: number;
  declare reviewId: number;
}

Like.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    reviewId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize,
    timestamps: false,
    tableName: 'Like',
  }
);

let User: typeof import('./user').User;
let Review: typeof import('./review').Review;

(async (): Promise<void> => {
  const userModule = await import('./user');
  const reviewModule = await import('./review');
  User = userModule.User;
  Review = reviewModule.Review;

  User.hasMany(Like, { foreignKey: 'userId' });
  Like.belongsTo(User, { foreignKey: 'userId' });

  Review.hasMany(Like, { foreignKey: 'reviewId' });
  Like.belongsTo(Review, { foreignKey: 'reviewId' });
})();
