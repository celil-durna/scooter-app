import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ResponseMessage } from '../models/response-message';
import { HttpClient } from '@angular/common/http';
import { Option } from '../models/option';

@Injectable({
  providedIn: 'root',
})
export class OptionsService {
  constructor(private http: HttpClient) {}

  success = 'Is successfull';
  failure = 'Is not successfull';
  optionRoute = '/api/options';
  
  //Methode um für einen User einen neuen Option eintrag zu erstellen, falls dies bei register nicht passiert ist.
  public saveOptions(
    speed: string,
    distance: string,
    currency: string
  ): Observable<ResponseMessage> {
    const optionsObservable = this.http
      .post<ResponseMessage>(this.optionRoute, {
        speed: speed,
        distance: distance,
        currency: currency,
      })
      .pipe(shareReplay());
    optionsObservable.subscribe({
      next: () => {
        console.log(this.success);
      },
      error: () => {
        console.log(this.failure);
      },
    });
    return optionsObservable;
  }

   //option Eintrag verändern
  public updateOptions(
    userId: number,
    speed: string,
    distance: string,
    currency: string
  ): Observable<ResponseMessage> {
    const optionsObservable = this.http
      .put<ResponseMessage>(this.optionRoute, {
        userId: userId,
        speed: speed,
        distance: distance,
        currency: currency,
      })
      .pipe(shareReplay());
    optionsObservable.subscribe({
      next: () => {
        console.log(this.success);
      },
      error: () => {
        console.log(this.failure);
      },
    });
    return optionsObservable;
  }

  public getOptions(): Observable<Option> {
    const optionObservable: Observable<Option> = this.http
      .get<Option>(this.optionRoute)
      .pipe(shareReplay());
    optionObservable.subscribe({
      error: (err) => {
        console.error(err);
      },
    });
    return optionObservable;
  }

  //Methode um für einen User einen neuen Option eintrag zu erstellen.
  public async setNewOptions(): Promise<Observable<ResponseMessage>> {
    const optionsObservable = this.http
      .post<ResponseMessage>(this.optionRoute, {
        speed: 'metric',
        distance: 'metric',
        currency: 'euro',
      })
      .pipe(shareReplay());
    optionsObservable.subscribe({
      next: () => {
        console.log(this.success);
      },
      error: () => {
        console.log(this.failure);
      },
    });
    return optionsObservable;
  }

  //Diese funktionen ändern die werte von imperial zu metrisch etc...

  public changeToEuro(option: Option, val: number): number {
    if (option.currency === 'euro') {
      return val / 1.09;
    }
    return val;
  }

  public changeToMiles(option: Option, val: number): number {
    if (option.distance === 'imperial') {
      return val * 0.621371;
    }
    return val;
  }

  public changeToMilePerHour(option: Option, val: number): number {
    if (option.speed === 'imperial') {
      return val * 0.621371;
    }
    return val;
  }

  public getSymbolSpeed(option: Option): string {
    if (option.speed === 'imperial') {
      return 'mp/h';
    }
    return 'km/h';
  }

  public getSymbolDistance(option: Option): string {
    if (option.distance === 'imperial') {
      return 'mi';
    }
    return 'km';
  }

  public getSymbolMoney(option: Option): string {
    if (option.currency === 'euro') {
      return '€';
    }
    return '$';
  }

  //schneidet das symbol aus der string heraus um eine reine number zu bekommen
  parsePrice(price: string): number {
    return parseFloat(price.replace(/[^0-9.-]+/g, ''));
  }
}
