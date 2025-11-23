/**
 *  In dieser Datei schreiben wir einen Controller, der Webrequests von
 *  dem in "app.ts" definierten Webserver beantwortet. Die Methoden werden
 *  in "app.ts" mit einer entsprechenden Webroute verknüpft.
 *  Jede Methode, die mit einer Webroute verknüpft wird, muss einen
 *  "Request" (was angefragt wird) und eine "response" (was unser Server antwortet)
 *  entgegennehmen.
 *  *Wichtig ist, dass jede Response zeitgemäß abgeschlossen wird*, z.B. via
 *  response.send(...data...)
 *  oder response.end()
 */
import { Request, Response } from 'express';


export class ApiController {
  public getInfo(request: Request, response: Response): void {
    response.status(200);
    response.send('ok');
  }

  public getDafinaKastratiInfo(request: Request, response: Response): void {
    response.status(200);
    response.send({
      firstName: 'Dafina',
      lastName: 'Kastrati',
      email: 'dafina.kastrati@uni-konstanz.de',
    });
  }

  public getJonasHeiligInfo(request: Request, response: Response): void {
    response.status(200);
    response.send({
      firstName: 'Jonas',
      lastName: 'Heilig',
      email: 'jonas.heilig@uni-konstanz.de',
    });
  }
  public getNaserThaqiInfo(request: Request, response: Response): void {
    response.status(200);
    response.send({
      firstName: 'Naser',
      lastName: 'Thaqi',
      email: 'naser.thaqi@uni-konstanz.de',
    });
  }

  public getCelilDurnaInfo(request: Request, response: Response): void {
    response.status(200);
    response.send({
      firstName: 'Celil',
      lastName: 'Durna',
      email: 'celil.durna@uni-konstanz.de',
    });
  }

  public getMichaelHuberInfo(request: Request, response: Response): void {
    response.status(200);
    response.send({
      firstName: 'Michael',
      lastName: 'Huber',
      email: 'michael.huber@uni-konstanz.de',
    });
  }

  public getMojtabaMalekNejadInfo(request: Request, response: Response): void {
    response.status(200);
    response.send({
      firstName: 'Mojtaba',
      lastName: 'Malek-Nejad',
      email: 'mojtaba.malek-nejad@uni-konstanz.de',
    });
  }

  public async postNameInfo(
    request: Request,
    response: Response
  ): Promise<void> {
    console.log(request.params.id);
    console.log(request.body.requestedName);
    response.status(200).send('ok');
  }
}
