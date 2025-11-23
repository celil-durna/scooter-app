import { Request, Response } from 'express';
import { Scooter } from './models/scooter';
import { Booking } from './models/booking';
import { Op } from 'sequelize';


export class ScooterController {
  public async getScooterById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const scooter = await Scooter.findByPk(id);
      if (scooter) {
        res.status(200).json(scooter);
      } else {
        res.status(404).send('Scooter not found');
      }
    } catch (error) {
      res.status(500).send('Error retrieving scooter');
    }
  }

  public async getAvailableScooters(req: Request, res: Response): Promise<void> {
    try {
      const bookedScooters = await Booking.findAll({
        where: {
          returnTime: {
            [Op.gt]: new Date(),
          },
        },
        attributes: ['scooterId'],
      });
  
      const bookedScooterIds = bookedScooters.map(booking => booking.scooterId);
  
      const availableScooters = await Scooter.findAll({
        where: {
          id: {
            [Op.notIn]: bookedScooterIds,
          },
        },
      });
  
      res.status(200).json(availableScooters);
    } catch (error) {
      console.error('Error retrieving available scooters:', error);
      res.status(500).send('Error retrieving scooter');
    }
  }
  
}
