import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ResponseMessage } from '../models/response-message';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  //Statusvariablen für Authentifizierung
  public loggedIn = false;
  public authChecked = false;

  constructor(private http: HttpClient) {}

  //Methode zum Überprüfen ob Benutzer eingeloggt ist
  public isLoggedIn(): boolean {
    return this.loggedIn;
  }

  //Methode zum Überprüfen der Authentifizierung beim Initialisieren
  public checkAuth(): Observable<boolean> {
    const authObservable: Observable<boolean> = this.http
      .get<boolean>('/api/auth')
      .pipe(shareReplay());
    authObservable.subscribe({
      next: (val) => {
        //Setzen des Authentifizierungsstatus je nach Antwort vom Backend
        this.loggedIn = val;
        this.authChecked = true;
      },
      error: (err) => {
        //Fehlerfall: Setzen des Authentifizierungsstatus auf false
        this.loggedIn = false;
        console.log(err);
      },
    });
    return authObservable;
  }

  // Methode zum Einloggen des Benutzers
  public login(email: string, password: string): Observable<ResponseMessage> {
    const loginObservable = this.http
      .post<ResponseMessage>('/api/login', {
        email: email,
        password: password,
      })
      .pipe(shareReplay());
    loginObservable.subscribe({
      next: (response) => {
        //Setzen des Authentifizierungsstatus je nach Antwort vom Backend
        this.loggedIn = response.code === 200;
      },
      error: () => {
        //Fehlerfall: Setzen des Authentifizierungsstatus auf false
        this.loggedIn = false;
      },
    });
    return loginObservable;
  }

  // Methode zum Ausloggen des Benutzers
  public logout(): Observable<ResponseMessage> {
    const logoutObservable: Observable<ResponseMessage> = this.http
      .delete<ResponseMessage>('/api/logout')
      .pipe(shareReplay());
    logoutObservable.subscribe({
      next: () => {
        //Setzen des Authentifizierungsstatus auf false
        this.loggedIn = false;
        this.authChecked = true;
      },
      error: (err) => {
        this.checkAuth();
        console.error(err);
      },
    });
    return logoutObservable;
  }

  public getUser(): Observable<User> {
    const userObservable: Observable<User> = this.http.get<User>('/api/userinfo').pipe(shareReplay());
    userObservable.subscribe({
      error: (err) => {
        this.checkAuth();
        console.error(err);
      }
    });
    return userObservable;
  }

  
  public updateUser(user: User): Observable<ResponseMessage> {
    console.log('Sending update request for user:', user); // Debugging
    return this.http.put<ResponseMessage>('/api/userinfo', user).pipe(shareReplay());
  }
  
}
