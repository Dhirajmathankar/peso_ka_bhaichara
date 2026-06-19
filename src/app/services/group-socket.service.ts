import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GroupSocketService {
  private socket!: Socket;
  private groupMsgSubject = new Subject<any>();
  private balanceRefreshSubject = new Subject<any>();
  private API_BASE = `${environment.apiUrl}/group-khata`;


  constructor(private http: HttpClient) {}
  
  initSocketConnection() {
    if (!this.socket) {
      this.socket = io(`${environment.apiUrl}`); // बैकएंड URL

      // लाइव ग्रुप मैसेज सुनना
      this.socket.on('new-group-msg', (data: any) => {
        this.groupMsgSubject.next(data);
      });

      // लाइव बैलेंस अपडेट सिग्नल
      this.socket.on('group-balance-refreshed', (data: any) => {
        this.balanceRefreshSubject.next(data);
      });
    }
  }

  joinGroupRoom(groupId: string) {
    if (this.socket) {
      this.socket.emit('join-group-room', groupId);
    }
  }

  get onNewGroupMessage(): Observable<any> {
    return this.groupMsgSubject.asObservable();
  }

  get onBalanceRefresh(): Observable<any> {
    return this.balanceRefreshSubject.asObservable();
  }

  getGroupChatHistory(groupId: string): Observable<any> {
    return this.http.get(`${this.API_BASE}/history/${groupId}`);
  }

  getGroupSummary(groupId: string): Observable<any> {
    return this.http.get(`${this.API_BASE}/summary/${groupId}`);
  }

  sendExpenseOrText(payload: any): Observable<any> {
    return this.http.post(`${this.API_BASE}/expense/send`, payload);
  }

  settlePayment(payload: any): Observable<any> {
    return this.http.post(`${this.API_BASE}/payment/settle`, payload);
  }
}