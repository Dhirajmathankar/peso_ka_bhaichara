import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private apiUrl = 'http://localhost:3000/api/v1';
  private socket!: Socket;

  // 🔄 RxJS States: जो पूरे ऐप में रीयल-टाइम डेटा ट्रांसफर करेंगे
  private walletSnapshot$ = new BehaviorSubject<any>(null);
  private todayTransactions$ = new BehaviorSubject<any[]>([]);
  private pastTransactions$ = new BehaviorSubject<any[]>([]);

  constructor(private http: HttpClient) {}

  /**
   * 🔌 1. Initialize Real-time Socket Connection
   */
  initSocket(userId: string): void {
    this.socket = io('http://localhost:3000');

    // अपने पर्सनल रूम में जॉइन करें ताकि दूसरों के SMS आपको न दिखें
    this.socket.emit('join-room', userId);

    // 📡 लाइव अपडेट्स सुनना (Listen to live balance changes)
    this.socket.on('wallet-update', (data: { totalNetBalance: number, banksBreakdown: any[], newTx: any }) => {
      // A. वॉलेट का स्नैपशॉट लाइव अपडेट करें
      this.walletSnapshot$.next({
        totalNetBalance: data.totalNetBalance,
        banksBreakdown: data.banksBreakdown
      });

      // B. आज की ट्रांजैक्शन लिस्ट में नया आइटम सबसे ऊपर पुश करें
      const currentTodayTx = this.todayTransactions$.getValue();
      this.todayTransactions$.next([data.newTx, ...currentTodayTx]);
    });
  }

  /**
   * 💳 2. Fetch Wallet Combined & Bankwise Balance
   */
  fetchWalletSnapshot(): void {
    this.http.get(`${this.apiUrl}/wallet/snapshot`).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.walletSnapshot$.next(res.data);
        }
      },
      error: (err) => console.error('Error fetching wallet snapshot', err)
    });
  }

  /**
   * 🕒 3. Fetch Transaction History (Today & Past)
   */
  fetchTransactionHistory(): void {
    this.http.get(`${this.apiUrl}/transactions/history`).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.todayTransactions$.next(res.data.todayTransactions);
          this.pastTransactions$.next(res.data.pastTransactions);
        }
      },
      error: (err) => console.error('Error fetching history', err)
    });
  }

  // --- Getters for Components to Subscribe ---
  getWalletSnapshot(): Observable<any> { return this.walletSnapshot$.asObservable(); }
  getTodayTransactions(): Observable<any[]> { return this.todayTransactions$.asObservable(); }
  getPastTransactions(): Observable<any[]> { return this.pastTransactions$.asObservable(); }

  /**
   * 🔌 Connection cleanup when user logs out
   */
  disconnectSocket(): void {
    if (this.socket) this.socket.disconnect();
  }
}