import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Scooter } from '../models/scooter';

@Injectable({
  providedIn: 'root'
})
export class ScooterService {
  private apiUrl = 'http://localhost:8000/api/scooters';
  private availableScootersUrl = 'http://localhost:8000/api/available-scooters';

  constructor(private http: HttpClient) {}

  getScooterInfo(): Observable<Scooter[]> {
    return this.http.get<Scooter[]>(this.apiUrl);
  }

  getAvailableScooters(): Observable<Scooter[]> {
    return this.http.get<Scooter[]>(this.availableScootersUrl);
  }

  getScooterById(scooterId: number): Observable<Scooter> {
    return this.http.get<Scooter>(`${this.apiUrl}/${scooterId}`);
  }
}
