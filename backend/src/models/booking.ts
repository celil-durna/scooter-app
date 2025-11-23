import { DataTypes, Model} from 'sequelize';
import  Database from '../database';

const sequelize = Database.getSequelize();


export class Booking extends Model {
  declare id: number;
  declare userId: number;
  declare scooterId: number;
  declare hours: number;
  declare totalPrice: number;
  declare bookingTime: Date;
  declare returnTime: Date;
}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    scooterId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    hours: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    bookingTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    returnTime: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'Booking',
    tableName: 'bookings',
    timestamps: false
  }
);

let User: typeof import('./user').User;
let Scooter: typeof import('./scooter').Scooter;

(async (): Promise<void> => {
  const userModule = await import('./user');
  User = userModule.User;
  Booking.belongsTo(User, { foreignKey: 'userId' });

  const scooterModule = await import('./scooter');
  Scooter = scooterModule.Scooter;
  Booking.belongsTo(Scooter, { foreignKey: 'scooterId' });
})();