import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ResponseMessage } from '../models/response-message';
import { HttpClient } from '@angular/common/http';
import { OptionsService } from './options.service';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {

  public registered = false;

  constructor(private http: HttpClient, private optionsService: OptionsService,) {
  }

  public isRegistered(): boolean {
    return this.registered;
  }

  public registrieren(
    firstName: string,
    lastName: string,
    street: string,
    streetNumber: string, // damit 13A oder 5/10 zugelassen wird
    plz: string,
    city: string,
    email: string,
    password: string
  ): Observable<ResponseMessage> {
    const registerObservable = this.http
      .post<ResponseMessage>('/api/register', {
        firstName: firstName,
        lastName: lastName,
        street: street,
        streetNumber: streetNumber,
        plz: plz,
        city: city,
        email: email,
        password: password,
      })
      .pipe(shareReplay());
    registerObservable.subscribe({
      next: (res) => {
        this.registered = res.code === 200;
        console.log('Successfully registered!');
      //hier wird Option erstellt
      this.optionsService.setNewOptions();  
      },
      error: () => {
        this.registered = false;
        console.log('Registration failed');
      },
    });
    return registerObservable;
  }
}
