import { Request, Response } from 'express';
import { UserSession } from './models/user';
import { Scooter } from './models/scooter';
import { Product } from './models/product';
import { Booking } from './models/booking';
import { Op } from 'sequelize';
import { pay } from './app';

export class BookingController {

  // eine neue Buchung erstellen
  public async createBooking(request: Request, response: Response): Promise<void> {
    const sessionId = request.cookies.sessionId;
    const { scooterId, hours, paymentMethodId, paymentMethodType } = request.body;

    console.log('sessionId:', sessionId);
    console.log('scooterId:', scooterId);
    console.log('Stunden:', hours);
    console.log('paymentMethodId:', paymentMethodId);
    console.log('paymentMethodType:', paymentMethodType);

    if (!sessionId) {
      response.status(409).json({ code: 409, message: 'User ist nicht eingeloggt' });
      return;
    }

    try {
      const session = await UserSession.findOne({ where: { sessionId: sessionId } });
      if (!session) {
        response.status(404).json({ code: 404, message: 'Session konnte nicht gefunden werden' });
        return;
      }

      const userId = session.userId;
      const scooter = await Scooter.findByPk(scooterId, {
        include: [Product],
      });
      if (!scooter) {
        response.status(404).json({ code: 404, message: 'Scooter konnte nicht gefunden werden' });
        return;
      }

      const product = scooter.get('Product') as Product;
      const pricePerHour = (typeof product.price_per_hour === 'string' ? product.price_per_hour : product.price_per_hour.toString()).replace(/[^0-9.-]+/g, '');
      const totalPrice = hours * parseFloat(pricePerHour);
      const roundedTotalPrice = parseFloat(totalPrice.toFixed(2));

      const requestValidate = { cookies: { sessionId }, body: { method: paymentMethodType, methodId: paymentMethodId, amount: roundedTotalPrice } } as unknown as Request;
      const { token, error: validationError } = await pay.validatePayment(requestValidate);
      if (!token) {
        console.log('Validierung der Zahlungsmethode fehlgeschlagen:', validationError);
        response.status(400).json({ code: 400, message: validationError });
        return;
      }

      console.log('Empfangener Token für die Transaktion:', token);

      const requestTransaction = { body: { method: paymentMethodType, token: token } } as unknown as Request;
      const { success, error: transactionError } = await pay.transactionPayment(requestTransaction);
      if (!success) {
        console.log('Zahlung fehlgeschlagen:', transactionError);
        response.status(400).json({ code: 400, message: transactionError });
        return;
      }

      const bookingTime = new Date();
      const returnTime = new Date(bookingTime.getTime() + hours * 60 * 60 * 1000);

      await Booking.create({
        userId: userId,
        scooterId: scooterId,
        hours: hours,
        totalPrice: roundedTotalPrice,
        bookingTime: bookingTime,
        returnTime: returnTime
      });

      console.log('Buchung erfolgreich!');
      response.status(201).json({
        code: 201,
        message: 'Buchung erfolgreich!',
        returnTime: returnTime,
        totalPrice: totalPrice
      });
    } catch (error) {
      console.error('Buchung konnte nicht durchgeführt werden. Fehler:', error);
      response.status(500).json({ code: 500, message: 'Buchung konnte nicht durchgeführt werden.' });
    }
  }


  // gibt alle nicht-gebuchten Scooter zurück
  public async getAvailableScooters(request: Request, response: Response): Promise<void> {
    try {
      const now = new Date();
      const bookedScooters = await Booking.findAll({
        where: {
          returnTime: { [Op.gt]: now }
        },
        attributes: ['scooterId']
      });

      const bookedScooterIds = bookedScooters.map(booking => booking.scooterId);

      const availableScooters = await Scooter.findAll({
        where: {
          id: { [Op.notIn]: bookedScooterIds }
        }
      });

      response.status(200).json(availableScooters);
    } catch (error) {
      console.error('Error fetching available scooters:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  }

  // gibt alle Buchungen eines Users zurück
  public async getBookingsByUserId(req: Request, res: Response): Promise<void> {
    const sessionId = req.cookies.sessionId;

    if (!sessionId) {
      res.status(409).json({ code: 409, message: 'User ist nicht eingeloggt' });
      return;
    }

    try {
      const session = await UserSession.findOne({ where: { sessionId: sessionId } });
      if (!session) {
        res.status(404).json({ code: 404, message: 'Session konnte nicht gefunden werden' });
        return;
      }

      const userId = session.userId;
      const bookings = await Booking.findAll({
        where: { userId: userId },
        include: [{
          model: Scooter,
          include: [Product]
        }]
      });

      res.status(200).json(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

}
