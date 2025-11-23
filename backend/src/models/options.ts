import { DataTypes, Model} from 'sequelize';
import  Database from '../database';

const sequelize = Database.getSequelize();

export class Options extends Model {
    declare userId:number ;
    declare speed : string;
    declare distance: string;
    declare currency: string;
    
  }

Options.init(
{
    userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true, 
    },

    speed: {
    type: DataTypes.STRING,
    allowNull: true,
    },
    
    distance: {
    type: DataTypes.STRING,
    allowNull: true,
    },

    currency: {
    type: DataTypes.STRING,
    allowNull: true,
    },

},
{
    sequelize,
    timestamps: false, 
    tableName: 'options',

}
);  

let User: typeof import('./user').User;
(async ():Promise<void> => {
const userModule = await import('./user');
User = userModule.User;

User.hasOne(Options, { foreignKey: 'userId' });
Options.belongsTo(User, { foreignKey: 'userId' });

});

  