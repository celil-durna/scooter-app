import { DataTypes, Model} from 'sequelize';
import Database from '../database';

const sequelize = Database.getSequelize();

export class Review extends Model {
    declare reviewId: number;
    declare userId: number;
    declare scooterId: number;
    declare text: string;
    declare helpfulCounter: number;
    declare edited: boolean;
    declare valuation: number;
    declare date: Date;
}

Review.init(
    {
        reviewId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: 'compositeKey'
        },
        scooterId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: 'compositeKey'
        },
        text: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        helpfulCounter: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        edited: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        valuation: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        }
    },
    {
        sequelize,
        timestamps: false,
        tableName: 'Review',
    }
);

let User: typeof import('./user').User;
let Scooter: typeof import('./scooter').Scooter;

(async (): Promise<void> => {
    // Import der Modelle für User und Product
    const userModule = await import('./user');
    const productModule = await import('./product');
    User = userModule.User;
    Scooter = productModule.Product;

    User.hasMany(Review, { foreignKey: 'userId' });
    Review.belongsTo(User, { foreignKey: 'userId'});

    Scooter.hasMany(Review, { foreignKey: 'scooterId' });
    Review.belongsTo(Scooter, { foreignKey: 'scooterId'});
});




