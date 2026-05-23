import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket!: Socket;
  public notification$ = new Subject<any>();

  constructor() {}

  connect(userId: string, activeTripId?: string) {
    // बैकएंड को क्रेडेंशियल्स पास करना
    this.socket = io('https://backendapi.onrender.com', {
      query: { userId, activeTripId }
    });

    // सर्वर से आने वाले लाइव सिंक नोटिफिकेशन को सुनना
    this.socket.on('ui_notification_update', (data) => {
      this.notification$.next(data);
    });
  }

  // ट्रिप बदलने पर रूम स्विच करने का फंक्शन
  switchTrip(tripId: string) {
    if (this.socket) {
      this.socket.emit('join_trip_room', { tripId });
    }
  }
}