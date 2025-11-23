import { DataTypes, Model } from 'sequelize';
import Database from '../database';
import { v4 as uuidv4 } from 'uuid';
import { Review } from './review';

const sequelize = Database.getSequelize();

export class User extends Model {
  declare userId: number;
  declare firstName: string;
  declare lastName: string;
  declare street: string;
  declare streetNumber: string;
  declare plz: string;
  declare city: string;
  declare email: string;
  declare password: string;
}

User.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true, // primary key
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    street: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    streetNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    plz: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },

    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // sicherstellen, dass E-Mail eindeutig
      validate: {
        isEmail: true, // validiert die E-Mail-Adresse
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false, //createdAt und updatedAt nicht erstellen
    tableName: 'user',
  }
);

export class UserSession extends Model {
  declare sessionId: string;
  declare userId: number;
  declare sessionStart: Date;
}

UserSession.init(
  {
    sessionId: {
      type: DataTypes.UUID,
      defaultValue: uuidv4, // Verwende uuidv4 als Standardwert
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sessionStart: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    tableName: 'user_session',
  }
);

// Beziehungen zu anderen Modellen
UserSession.belongsTo(User, { foreignKey: 'userId', targetKey: 'userId' });
User.hasMany(UserSession, { foreignKey: 'userId' });

User.hasMany(Review, { foreignKey: 'userId' }); 
Review.belongsTo(User, { foreignKey: 'userId' }); 
