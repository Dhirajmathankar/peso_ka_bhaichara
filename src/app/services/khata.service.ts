import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // अपने एनवायरनमेंट पाथ के हिसाब से बदलें

export interface KhataEntry {
  id?: string;
  personName: string;
  personPhone: string;
  amount: number;
  khataType: 'will-get' | 'will-give';
  reason: string;
  paymentMode: 'cash' | 'online';
  alertStatus?: string;
  createdAt?: Date;
}

export interface KhataResponse {
  status: string;
  data: {
    summary: {
      totalNetKhataBalance: number;
      youWillGetFromOthers: number;
      youWillGiveToOthers: number;
    };
    history: KhataEntry[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class KhataService {
  // बैकएंड यूआरएल (अपने पोर्ट के अनुसार सेट करें)
  private apiUrl = `${environment.apiUrl}/khata`; 

  constructor(private http: HttpClient) {}

  // खाता एंट्री जोड़ने के लिए API
  addKhataEntry(entry: KhataEntry): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, entry);
  }

  // पूरी खाता लिस्ट और समरी प्राप्त करने के लिए API
  getKhataDashboard(): Observable<KhataResponse> {
    return this.http.get<KhataResponse>(`${this.apiUrl}/info-list`);
  }
}