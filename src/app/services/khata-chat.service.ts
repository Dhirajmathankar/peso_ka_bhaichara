import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class KhataChatService {
  private apiUrl = `${environment.apiUrl}/v1/khata-chat`;

  constructor(private http: HttpClient) {}

  getChatHistory(phone: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/history/${phone}`);
  }

  sendMessage(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, payload);
  }
}