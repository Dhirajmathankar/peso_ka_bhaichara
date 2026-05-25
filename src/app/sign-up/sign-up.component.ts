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
import { AuthService } from '../services/auth.service';
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
  activeTripId = ''; 
  isLoading = false;

  constructor(private authService: AuthService, private router: Router, private toastService: ToastService) {}

  onSignUp() {
    if (!this.email || !this.password || !this.phone) {
      this.toastService.show('⚠️ कृपया सभी ज़रूरी फ़ील्ड्स भरें!', 'error');
      return;
    }

    this.isLoading = true;
    const payload = { email: this.email, password: this.password, phone: this.phone, activeTripId: this.activeTripId || 'trip_trip_goa_2026' };

    this.authService.signUp(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        sessionStorage.setItem('token', res.token);
        sessionStorage.setItem('email', res.user.email);
        sessionStorage.setItem('phone', res.user.phone);
        sessionStorage.setItem('userId', res.user.id);
        sessionStorage.setItem('activeTripId', res.user.activeTripId || '');

        this.syncWithAndroid( res.token, res.user.id, res.user.email, res.user.phone, res.user.activeTripId || '');
        this.toastService.show('🟢 साइन-अप सफल! आपका स्वागत है।', 'success');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.show('❌ सर्वर एरर या डुप्लिकेट यूज़र डिटेल्स!', 'error');
      }
    });
  }

  private syncWithAndroid( accessToken :any , userId: string, email: string, phone: string, tripId: string) {
    if ((window as any).AndroidBridge) {
      if ((window as any).AndroidBridge.saveUserData) (window as any).AndroidBridge.saveUserData(accessToken, userId, email, phone, tripId);
      else if ((window as any).AndroidBridge.sendUserSessionToNative) (window as any).AndroidBridge.sendUserSessionToNative(accessToken, userId, email, phone, tripId);
    }
  }
}