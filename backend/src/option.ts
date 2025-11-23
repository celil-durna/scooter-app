import { Options } from './models/options';
import { Request, Response } from 'express';
import { UserSession } from './models/user';

export class OptionController {
  public async postOption(request: Request, response: Response): Promise<void> {
    const { speed, distance, currency } = request.body;

    const sessionId = request.cookies.sessionId;
    const session = (await UserSession.findOne({
      where: { sessionId: sessionId },
    }));
    const userId = session.userId; 
    console.log(userId, 'userId');

    try {
      console.log('Received postoption request:', request.body);
      await Options.create({ userId, speed, distance, currency });
      response.status(201).send({ message: 'Option successfully created' });
    } catch (error) {
      console.error('Error saving options:', error);
      response.status(500).send({
        code: 500,
        message: 'Internal Server Error bei option-saving',
      });
    }
  }

  public async putOption(request: Request, response: Response): Promise<void> {
    try {
      console.log('Received putoption request:', request.body);
      const userId = request.body.userId;
      const updatedData = request.body;
      const [affectedRows] = await Options.update(updatedData, {
        where: { userId },
      });
      response
        .status(200)
        .send({ message: 'Option successfully updated', affectedRows });
    } catch (error) {
      console.error('Error updating options:', error);
      response.status(500).send({
        code: 500,
        message: 'Internal Server Error bei option-saving',
      });
    }
  }

  public async getOptionById(req: Request, res: Response): Promise<void> {
    const sessionId = req.cookies.sessionId;
    const session = (await UserSession.findOne({
      where: { sessionId: sessionId },
    }));
    const userId = session.userId; 
    console.log(userId, 'userId');
    try {
      const options = await Options.findOne({ where: { userId:userId } });
      console.log(options);
      if (options) {
        res.status(200).json(options);
      } else {
        res.status(404).send('Option not found');
      }
    } catch (error) {
      res.status(500).send('Error retrieving Option');
    }
  }
}