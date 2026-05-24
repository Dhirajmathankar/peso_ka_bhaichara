// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-sign-up',
//   templateUrl: './sign-up.component.html',
//   styleUrls: ['./sign-up.component.css']
// })
// export class SignUpComponent {

// }


import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
  email = '';
  password = '';
  phone = '';
  activeTripId = ''; // वैकल्पिक: डिफ़ॉल्ट रूप से खाली या डमी "trip_trip_goa_2026" रख सकते हैं
  
  errorMessage = '';
  isLoading = false;

  constructor(private http: HttpClient, private router: Router, private toastService: ToastService) {}

  onSignUp() {
    // बेसिक वैलिडेशन चेक
    if (!this.email || !this.password || !this.phone) {
      this.errorMessage = 'कृपया सभी ज़रूरी फ़ील्ड्स भरें भाई!';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      email: this.email,
      password: this.password,
      phone: this.phone,
      activeTripId: this.activeTripId || 'trip_trip_goa_2026' // टेस्टिंग को मक्खन बनाने के लिए डिफ़ॉल्ट डमी ट्रिप आईडी
    };

    // 🚀 नए ऑथ रूट के अंदर साइन-अप एपीआई हिट करना
    this.http.post('http://localhost:5000/api/auth/signup', payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        
        // 💾 1. वेब ब्राउज़र लोकलस्टोरेज में सेशन सेव करना
        localStorage.setItem('token', res.token);
        localStorage.setItem('email', res.user.email);
        localStorage.setItem('phone', res.user.phone);
        localStorage.setItem('userId', res.user._id);
        localStorage.setItem('activeTripId', res.user.activeTripId || '');

        // 📱 2. कोटलिन (WebView Bridge) को लाइव डेटा भेजना ताकि ऐप बंद होने पर भी सॉकेट काम करे
        this.syncWithAndroid(res.user._id, res.user.email, res.user.phone, res.user.activeTripId || '');
        this.toastService.show('🟢 साइन-अप सफल! आपका स्वागत है भाई।', 'success');
        // 🔄 होम स्क्रीन पर नेविगेट करें
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.toastService.show('❌ सर्वर एरर: फोन और नाम आवश्यक हैं भाई!', 'error');
        this.isLoading = false;
      }
    });
  }

  // 🌉 एंड्रॉइड कोटलिन के साथ ब्रिज सिंकिंग
  private syncWithAndroid(userId: string, email: string, phone: string, tripId: string) {
    if ((window as any).AndroidBridge) {
      if ((window as any).AndroidBridge.saveUserData) {
        (window as any).AndroidBridge.saveUserData(userId, email, phone, tripId);
      } else if ((window as any).AndroidBridge.sendUserSessionToNative) {
        (window as any).AndroidBridge.sendUserSessionToNative(userId, email, phone, tripId);
      }
      console.log('🟢 [SIGNUP_SYNC] डेटा एंड्रॉइड नेटिव में परमानेंटली स्टोर हो गया!');
    }
  }
}