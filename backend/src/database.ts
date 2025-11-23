import { Sequelize } from 'sequelize';

export class Database {
  private sequelize: Sequelize;

  constructor() {
    this.sequelize = new Sequelize(
      'postgres://admin:gruppe3@localhost:5432/swp'
    );
  }

  public getSequelize(): Sequelize {
    return this.sequelize;
  }

  public synchronizeTables = async (): Promise<void> => {
    try {
      await this.sequelize.sync();
    } catch (error) {
      console.log(error);
    }
  };
}

export default new Database();