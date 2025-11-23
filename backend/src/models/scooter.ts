import { DataTypes, Model } from 'sequelize';
import Database from '../database';
import { Product } from './product'; // Import the Product model

const sequelize = Database.getSequelize();

export class Scooter extends Model {}

Scooter.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    product: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Product,
        key: 'name',
      },
    },
    battery: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    coordinates_lat: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    coordinates_lng: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'scooters',
    timestamps: false,
  }
);

Scooter.belongsTo(Product, { foreignKey: 'product', targetKey: 'name' });