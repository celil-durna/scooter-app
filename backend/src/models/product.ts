import { DataTypes, Model } from 'sequelize';
import Database from '../database';

const sequelize = Database.getSequelize();

export class Product extends Model {
  declare id: number;
  declare name: string;
  declare brand: string;
  declare image: string;
  declare max_reach: number;
  declare max_speed: number;
  declare price_per_hour: number;
  declare description_html: string;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    max_reach: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    max_speed: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    price_per_hour: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    description_html: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'products',
    timestamps: false,
  }
);
