import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;
  public notification$ = new Subject<any>();

  connectSocket() {
    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('email');
    const phone = localStorage.getItem('phone');
    const activeTripId = localStorage.getItem('activeTripId');

    if (!userId) return;

    // सॉकेट कनेक्शन इनिशियलाइज़ेशन ऑथ टोकन के साथ
    this.socket = io('https://backend-api-0m05.onrender.com', {
      auth: { userId, email, phone, activeTripId }
    });

    // बैकएंड से आने वाले लाइव इवेंट को कैच करना
    this.socket.on('ui_notification_update', (data: any) => {
      this.notification$.next(data);
    });
  }

  disconnect() {
    if (this.socket) this.socket.disconnect();
  }
}