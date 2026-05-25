import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // private baseUrl = `${environment.apiUrl}/notifications`; // आपके रूट्स के अनुसार

  constructor(private http: HttpClient) {}

  // // इंटरसेप्टर अपने आप इसमें हेडर जोड़ देगा, यहाँ लिखने की ज़रूरत नहीं है भाई!
  // getSummary(): Observable<any> {
  //   return this.http.get(`${this.baseUrl}/dashboard-summary`);
  // }
  private baseUrl = `${environment.apiUrl}/dashboard`;

  getSummary(): Observable<any> {
    return this.http.get(`${this.baseUrl}/summary`);
  }

  addManualEntry(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add-entry`, payload);
  }

  createNewTrip(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/create-trip`, payload);
  }
}