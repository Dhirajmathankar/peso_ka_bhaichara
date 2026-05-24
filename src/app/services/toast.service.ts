import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastData {
  message: string;
  type: 'success' | 'error';
  show: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // BehaviorSubject का उपयोग करके स्टेट को ब्रॉडकास्ट करेंगे
  private toastState = new BehaviorSubject<ToastData>({ message: '', type: 'success', show: false });
  toastState$ = this.toastState.asObservable();

  private timeoutId: any;

  // 🚀 पूरी ऐप में कहीं से भी इसे कॉल करें भाई
  show(message: string, type: 'success' | 'error' = 'success') {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // टोस्ट को एक्टिव करें
    this.toastState.next({ message, type, show: true });

    // 3 सेकंड बाद ऑटो-हाइड करें
    this.timeoutId = setTimeout(() => {
      this.hide();
    }, 3000);
  }

  hide() {
    this.toastState.next({ message: '', type: 'success', show: false });
  }
}