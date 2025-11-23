import { Request, Response } from 'express';
import { User, UserSession } from './models/user';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import {Op} from 'sequelize';
/*
import { Request, Response, NextFunction } from 'express';
import { User } from './models/user';
import uid from 'uid-safe';
import { Session } from './models/user_sessions';
*/
export class AuthController {
  //Middleware
  /*
  public async authorize(request: Request, response: Response, next: NextFunction): Promise<void> {
    //next() leitet auf eigentliche Route weiter
    //Überprüfen ob eine sessionId in den Cookies mitgeliefert wird (wenn nicht kann der User nicht eingeloggt sein)
    const sessionId = request.cookies.sessionId;
    if (!sessionId) return next();

    //Gibt es die Session in der Datenbank
    const session = await UserSession.findOne({
      where: { sessionId: sessionId },
    });
    if (!session) return next();
    response.locals.session = session;

    //Überprüfe ob ein User zur Session existiert
    const user = await User.findOne({
      where: { id: await session.getDataValue('userId')},
    });

    if (!user) return next();
    response.locals.user = user;
  }*/

  public async login(request: Request, response: Response): Promise<void> {
    const loginEmail: string = request.body.email;
    const loginPassword: string = request.body.password;
    try {
      const user = await User.findOne({ where: { email:{ [Op.iLike]:loginEmail}  } });
      if (!user) {
        response.status(401).json({
          code: 401,
          message: 'E-Mail-Adresse konnte nicht gefunden werden',
        }); // 401: Unauthorized
        return;
      }
      // Passwort prüfen
      const passwordMatch = await bcrypt.compare(loginPassword, user.password);
      if (!passwordMatch) {
        response.status(401).json({ code: 401, message: 'Falsches Passwort' });
        return;
      }

      // Session erstellen
      try {
        await this.createSession(request, response, user.userId);
      } catch (error) {
        console.error('Error creating session:', error);
        return;
      }
      // Authentifizierung erfolgreich
    } catch (error) {
      console.error('Error during login:', error);
      response
        .status(500)
        .json({ code: 500, message: 'Internal Server Error bei Login' });
    }
  }

  public async getAuth(request: Request, response: Response): Promise<void> {
    // Überprüfen, ob eine sessionId in den Cookies mitgeliefert wird, wenn nicht kann der User nicht eingeloggt sein
    const sessionId = request.cookies.sessionId;
    if (!sessionId) {
      response.status(200).send(false);
      return;
    }
    try {
      // Überprüfen, ob eine Session mit der sessionId existiert (also der User eingeloggt ist)
      const session = (await UserSession.findOne({
        where: { sessionId: sessionId },
      })) as UserSession;
      if (!session) {
        response.status(200).send(false);
        return;
      }

      // Vergleichen der Session-ID aus dem Cookie mit der Session-ID aus der Datenbank
      if (session.sessionId !== sessionId) {
        response.status(200).send(false);
        return;
      }
      response.status(200).send(true);
      return;
    } catch (error) {
      console.error('Error during getAuth:', error);
      response
        .status(500)
        .json({ code: 500, message: 'Internal Server Error bei getAuth' });
    }
  }

  public async createSession(
    request: Request,
    response: Response,
    inputUserId: number
  ): Promise<void> {
    try {
      // Erstelle eine neue Session für den Benutzer
      const session = await UserSession.create({
        sessionId: uuidv4(), // Verwendung von UUID für sessionID
        userId: inputUserId,
        sessionStart: new Date(),
      });

      // Setze die Session-ID als Cookie im Response-Header
      response.cookie('sessionId', session.sessionId, {
        httpOnly: true,
        secure: false, // Setze dies auf true, wenn du HTTPS verwendest
        sameSite: 'strict', // Optional: um CSRF-Angriffe zu verhindern
      });

      console.log('Cookie gesetzt:', session.sessionId); // Debugging-Ausgabe

      response
        .status(200)
        .json({ code: 200, message: 'Session created successfully' });
    } catch (error) {
      console.error('Error creating session:', error);
      response
        .status(500)
        .json({ code: 500, message: 'Internal Server Error createSession' });
    }
  }

  public async register(request: Request, response: Response): Promise<void> {
    const {
      firstName,
      lastName,
      street,
      streetNumber,
      plz,
      city,
      email,
      password,
    } = request.body;
    try {
      // Überprüfen, ob ein Benutzer mit dieser E-Mail-Adresse bereits registriert ist
      const existingUser = await User.findOne({ where: { email:{ [Op.iLike]:email}  } });
      if (existingUser) {
        console.log('User bereits registriert:', email); // Debugging-Ausgabe
        response
          .status(409)
          .json({ code: 409, message: 'E-Mail-Adresse ist vergeben' });
        return;
      }

      // Erstelle neuen User und füge ihn in die Tabelle ein
      const hashedPassword = bcrypt.hashSync(password, 10);
      await User.create({
        firstName,
        lastName,
        street,
        streetNumber,
        plz,
        city,
        email,
        password: hashedPassword,
      });

      //console.log('User created:', newUser.getDataValue('userID')); // Debugging-Ausgabe
      const createdUser = await User.findOne({ where: { email } });
      const currentId = createdUser.userId;

      await this.createSession(request, response, currentId);
      console.log('Registrierung war Erfolgreich');
    } catch (error) {
      console.error('Error registering user:', error); // Detaillierte Fehlerausgabe
      response
        .status(500)
        .send({ code: 500, message: 'Internal Server Error bei Register' });
    }
  }

  public async logout(request: Request, response: Response): Promise<void> {
    const sessionId = request.cookies.sessionId;
    //Gibt es einen Session-Cookie? Überprüfen
    if (!sessionId) {
      response.status(409);
      response.send({ code: 409, message: 'User is not logged in' });
      return;
    }
    //Überprüfen ob eine Session in der Datenbank gibt
    const session = await UserSession.findOne({
      where: { sessionId: sessionId },
    });
    if (!session) {
      response.status(409);
      response.send({ code: 409, message: 'User is not logged in' });
      return;
    }
    //Zeile in der Datenbank löschen
    await session.destroy();

    response.status(200);
    response.clearCookie('sessionId');
    response.send({ code: 200, message: 'Logout successful' });
    return;
  }

  public async getUserInfo(
    request: Request,
    response: Response
  ): Promise<void> {
    const sessionId = request.cookies.sessionId;

    console.log('Session ID from cookies:', sessionId); // Debugging-Ausgabe

    if (!sessionId) {
      response.status(401).json({ error: 'Not authenticated' });
      return;
    }

    try {
      const session = await UserSession.findOne({ where: { sessionId } });

      console.log('Session found:', session); // Debugging-Ausgabe

      if (!session) {
        response.status(401).json({ error: 'Invalid session' });
        return;
      }

      const user = await User.findByPk(session.userId, {
        attributes: [
          'userId',
          'firstName',
          'lastName',
          'email',
          'street',
          'streetNumber',
          'plz',
          'city',
        ], // Wähle die benötigten Attribute aus
      });

      console.log('User found:', user); // Debugging-Ausgabe

      if (user) {
        response.status(200).json(user);
      } else {
        response.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      response.status(500).json({ error: 'Internal Server Error' });
    }
  }

  public async updateUserInfo(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const userId = request.body.userId;
      const updatedData = request.body;

      // Filter out fields that should not be updated
      delete updatedData.password;
      delete updatedData.email;

      console.log('Received update request for user:', userId); // Debugging
      console.log('Data to update:', updatedData); // Debugging

      const [affectedRows] = await User.update(updatedData, {
        where: { userId },
      });

      console.log('Affected rows:', affectedRows); // Debugging

      if (affectedRows > 0) {
        response.status(200).send({ message: 'User updated successfully' });
      } else {
        response.status(404).send({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      response.status(500).send({ message: 'Internal server error' });
    }
  }
}
