import {DataTypes, Model} from 'sequelize';
import Database from '../database';

const sequelize = Database.getSequelize();

export class PaymentBachelorCard extends Model {
  declare id: number;
  declare userId: number;
  declare name: string;
  declare cardNumber: string;
  declare securityCode: string;
  declare expirationDate: string;
}

PaymentBachelorCard.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: 'compositeKey',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cardNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'compositeKey',
    },
    securityCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expirationDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    tableName: 'payment_bachelorcard'
  }
);

export class PaymentHciPal extends Model {
  declare id: number;
  declare userId: number;
  declare email: string;
  declare password: string;
}

PaymentHciPal.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: 'compositeKey',
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'compositeKey',
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    tableName: 'payment_hcipal',
  }
);

export class PaymentSwpsafe extends Model {
  declare id: number;
  declare userId: number;
  declare swpCode: string;
}

PaymentSwpsafe.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: 'compositeKey',
    },
    swpCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'compositeKey',
    },
  },
  {
    sequelize,
    timestamps: false,
    tableName: 'payment_swpsafe'
  }
);

let User: typeof import('./user').User;

(async ():Promise<void> => {
  // Dynamisches Importieren von User
  const userModule = await import('./user');
  User = userModule.User;

  User.hasMany(PaymentBachelorCard, { foreignKey: 'userId' });
  PaymentBachelorCard.belongsTo(User, { foreignKey: 'userId' });

  User.hasMany(PaymentHciPal, { foreignKey: 'userId' });
  PaymentHciPal.belongsTo(User, { foreignKey: 'userId' });

  User.hasMany(PaymentSwpsafe, { foreignKey: 'userId' });
  PaymentSwpsafe.belongsTo(User, { foreignKey: 'userId' });
});