
// import { Component } from '@angular/core';
// import { Router } from '@angular/router';
// import { HttpClient } from '@angular/common/http'; 


// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.css']
// })
// export class LoginComponent {
//   email = '';
//   password = '';

//   constructor(private http: HttpClient, private router: Router) {}

//   onLogin() {
//     const payload = { email: this.email, password: this.password };
    
//     this.http.post('https://backend-api-0m05.onrender.com/api/login', payload).subscribe({
//       next: (res: any) => {
//         // 💾 1. वेब ब्राउज़र/लोकल स्टोरेज के लिए डेटा सेव करना
//         localStorage.setItem('token', res.token);
//         localStorage.setItem('email', res.user.email);
//         localStorage.setItem('phone', res.user.phone);
//         localStorage.setItem('userId', res.user._id);
//         localStorage.setItem('activeTripId', res.user.activeTripId || '');

//         // 🚀 2. यहाँ पर लगाया भाई! एंड्रॉइड कोटलिन (WebView) को लाइव डेटा भेजना
//         if ((window as any).AndroidBridge) {
//           (window as any).AndroidBridge.saveUserData(
//             res.user._id,
//             res.user.email,
//             res.user.phone,
//             res.user.activeTripId || ''
//           );
//           console.log('🚀 डेटा सफलतापूर्वक एंड्रॉइड ब्रिज को भेज दिया गया है!');
//         }

//         // 🔄 3. लॉगिन के बाद होम स्क्रीन पर नेविगेट करना
//         this.router.navigate(['/home']);
//       },
//       error: (err) => {
       
//         const userId = 'userNo-01';
//     const email = "dhirajmathankar@gmail.com";
//     const phone = "6261109366";
//     const tripId = "";

//          if ((window as any).AndroidBridge && (window as any).AndroidBridge.sendUserSessionToNative) {
//         // यह लाइन सीधे कोटलिन के फंक्शन को कॉल करेगी और डेटा एंड्रॉइड में चला जाएगा
//         (window as any).AndroidBridge.sendUserSessionToNative(userId, email, phone, tripId);
//         console.log("Session successfully passed to Native Android!");
//     } else {
//         console.log("Running in standard web browser, Native Bridge not found.");
//     }
//   this.router.navigate(['/home']);

//         console.error('Login Failed', err);
//         // alert('लॉगिन फेल हो गया! कृपया ईमेल और पासवर्ड चेक करें।');
//       }
//     });
//   }
// }

// import { Component } from '@angular/core';
// import { Router } from '@angular/router';
// import { HttpClient } from '@angular/common/http'; 
// import { SocketService } from '../../services/socket.service';
// import { ToastService } from '../services/toast.service';

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.css']
// })
// export class LoginComponent {
//   // लॉगिन वेरिएबल्स
//   email = '';
//   password = '';

//   // 🔥 कस्टम फॉरगॉट पासवर्ड पॉपअप स्टेट्स
//   isForgotPopupOpen = false;
//   forgotEmail = '';
//   forgotNewPassword = '';
//   popupMessage = '';
//   isPopupError = false;
//   isPopupLoading = false;

//   constructor(private http: HttpClient, private router: Router, private socketService: SocketService , private toastService: ToastService) {}

//   onLogin() {
//     const payload = { email: this.email, password: this.password };
    
//     this.http.post('http://localhost:5000/api/auth/login', payload).subscribe({
//       next: (res: any) => {
//         localStorage.setItem('token', res.token);
//         localStorage.setItem('email', res.user.email);
//         localStorage.setItem('phone', res.user.phone);
//         localStorage.setItem('userId', res.user._id);
//         localStorage.setItem('activeTripId', res.user.activeTripId || '');

//         this.syncWithAndroid(res.user._id, res.user.email, res.user.phone, res.user.activeTripId || '');
//         this.socketService.connectSocket();
//         this.toastService.show('🟢 लॉगिन सफल! आपका स्वागत है भाई।', 'success');
//         this.router.navigate(['/home']);
//       },
//       error: (err) => {
//         this.toastService.show('❌ सर्वर एरर: फोन और नाम आवश्यक हैं भाई!', 'error');
//       }
//     });
//   }

//   // 🔓 पॉपअप ओपन करने का फंक्शन
//   openForgotModal() {
//     this.isForgotPopupOpen = true;
//     this.forgotEmail = '';
//     this.forgotNewPassword = '';
//     this.popupMessage = '';
//   }

//   // 🔒 पॉपअप क्लोज करने का फंक्शन
//   closeForgotModal() {
//     this.isForgotPopupOpen = false;
//   }

//   // 🚀 कस्टम पॉपअप से सबमिट करने का एंड-टू-एंड लॉजिक
//   submitForgotPassword() {
//     if (!this.forgotEmail || !this.forgotNewPassword) {
//       this.isPopupError = true;
//       this.popupMessage = "कृपया सभी फ़ील्ड्स भरें भाई!";
//       return;
//     }

//     if (this.forgotNewPassword.length < 4) {
//       this.isPopupError = true;
//       this.popupMessage = "पासवर्ड कम से कम 4 अक्षरों का होना चाहिए!";
//       return;
//     }

//     this.isPopupLoading = true;
//     this.popupMessage = '';

//     const payload = { email: this.forgotEmail, newPassword: this.forgotNewPassword };

//     this.http.post('http://localhost:5000/api/auth/forgot-password', payload).subscribe({
//       next: (res: any) => {
//         this.isPopupLoading = false;
//         this.isPopupError = false;
//         this.popupMessage = "🟢 पासवर्ड सफलतापूर्वक बदल गया! अब आप लॉगिन कर सकते हैं।";
        
//         // 2 सेकंड बाद पॉपअप अपने आप बंद हो जाएगा
//         setTimeout(() => this.closeForgotModal(), 2500);
//       },
//       error: (err) => {
//         this.isPopupLoading = false;
//         console.warn("Backend offline, testing mode bypass invoked.");
        
//         this.isPopupError = false;
//         this.popupMessage = `🟢 [TEST MODE] पासवर्ड रीसेट मान लिया गया है!\nEmail: ${this.forgotEmail}`;
        
//         setTimeout(() => this.closeForgotModal(), 2500);
//       }
//     });
//   }

//   private syncWithAndroid(userId: string, email: string, phone: string, tripId: string) {
//     if ((window as any).AndroidBridge) {
//       if ((window as any).AndroidBridge.saveUserData) {
//         (window as any).AndroidBridge.saveUserData(userId, email, phone, tripId);
//       } else if ((window as any).AndroidBridge.sendUserSessionToNative) {
//         (window as any).AndroidBridge.sendUserSessionToNative(userId, email, phone, tripId);
//       }
//     }
//   }
// }



import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';

  isForgotPopupOpen = false;
  forgotEmail = '';
  forgotNewPassword = '';
  popupMessage = '';
  isPopupError = false;
  isPopupLoading = false;

  constructor(
    private authService: AuthService, 
    private router: Router, 
    private socketService: SocketService, 
    private toastService: ToastService
  ) {}

  onLogin() {
    const payload = { email: this.email, password: this.password };
    
    this.authService.login(payload).subscribe({
      next: (res: any) => {
        this.saveSession(res.accessToken, res.user);
        this.toastService.show('🟢 लॉगिन सफल! आपका स्वागत है।', 'success');
        this.router.navigate(['/home']);
      },
      error: (err) => {
         this.toastService.show('❌ सर्वर एरर: फोन और नाम आवश्यक हैं!', 'error');
      }
    });
  }

  submitForgotPassword() {
    if (!this.forgotEmail || !this.forgotNewPassword) {
      this.isPopupError = true;
      this.popupMessage = "कृपया सभी फ़ील्ड्स भरें!";
      return;
    }

    this.isPopupLoading = true;
    this.authService.forgotPassword({ email: this.forgotEmail, newPassword: this.forgotNewPassword }).subscribe({
      next: (res: any) => {
        this.isPopupLoading = false;
        this.isPopupError = false;
        this.popupMessage = "🟢 पासवर्ड सफलतापूर्वक बदल गया! अब आप लॉगिन कर सकते हैं।";
        this.toastService.show('🟢 पासवर्ड सफलतापूर्वक बदल गया! अब आप लॉगिन कर सकते हैं।', 'success');
        setTimeout(() => this.closeForgotModal(), 2500);
      },
      error: (err) => {
        this.isPopupLoading = false;
        this.isPopupError = false;
        this.popupMessage = `❌ पासवर्ड रीसेट करने में समस्या हुई!\nकृपया दोबारा प्रयास करें।`;
        this.toastService.show(
          '❌ पासवर्ड रीसेट नहीं हो पाया। कृपया फिर से कोशिश करें।',
          'error'
        );
        setTimeout(() => this.closeForgotModal(), 2500);
      }
    });
  }

  private saveSession(token: string, user: any) {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('email', user.email);
    sessionStorage.setItem('phone', user.phone);
    sessionStorage.setItem('userId', user.id);
    sessionStorage.setItem('activeTripId', user.activeTripId || '');

    this.syncWithAndroid(user._id, user.email, user.phone, user.activeTripId || '');
    this.socketService.connectSocket();
  }

  openForgotModal() { this.isForgotPopupOpen = true; this.forgotEmail = ''; this.forgotNewPassword = ''; this.popupMessage = ''; }
  closeForgotModal() { this.isForgotPopupOpen = false; }

  private syncWithAndroid(userId: string, email: string, phone: string, tripId: string) {
    if ((window as any).AndroidBridge) {
      if ((window as any).AndroidBridge.saveUserData) (window as any).AndroidBridge.saveUserData(userId, email, phone, tripId);
      else if ((window as any).AndroidBridge.sendUserSessionToNative) (window as any).AndroidBridge.sendUserSessionToNative(userId, email, phone, tripId);
    }
  }
}