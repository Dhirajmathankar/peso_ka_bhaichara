
// import { Component } from '@angular/core';
// import { Router } from '@angular/router';
// import { AuthService } from '../services/auth.service';
// import { SocketService } from '../../services/socket.service';
// import { ToastService } from '../services/toast.service';

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.css']
// })
// export class LoginComponent {
//   email = '';
//   password = '';

//   isForgotPopupOpen = false;
//   forgotEmail = '';
//   forgotNewPassword = '';
//   popupMessage = '';
//   isPopupError = false;
//   isPopupLoading = false;

//   constructor(
//     private authService: AuthService, 
//     private router: Router, 
//     private socketService: SocketService, 
//     private toastService: ToastService
//   ) {}

//   onLogin() {
//     const payload = { email: this.email, password: this.password };
    
//     this.authService.login(payload).subscribe({
//       next: (res: any) => {
//         this.saveSession(res.token, res.user);
//         this.toastService.show('🟢 लॉगिन सफल! आपका स्वागत है।', 'success');
//         this.syncWithAndroid(
//           res.token, 
//           res.user.id || res.user._id, 
//           res.user.email, 
//           res.user.phone || '', 
//           res.user.activeTripId || ''
//         );
//         this.router.navigate(['/home']);
//       },
//       error: (err) => {
//          this.toastService.show('❌ सर्वर एरर: फोन और नाम आवश्यक हैं!', 'error');
//       }
//     });
//   }

//   submitForgotPassword() {
//     if (!this.forgotEmail || !this.forgotNewPassword) {
//       this.isPopupError = true;
//       this.popupMessage = "कृपया सभी फ़ील्ड्स भरें!";
//       return;
//     }

//     this.isPopupLoading = true;
//     this.authService.forgotPassword({ email: this.forgotEmail, newPassword: this.forgotNewPassword }).subscribe({
//       next: (res: any) => {
//         this.isPopupLoading = false;
//         this.isPopupError = false;
//         this.popupMessage = "🟢 पासवर्ड सफलतापूर्वक बदल गया! अब आप लॉगिन कर सकते हैं।";
//         this.toastService.show('🟢 पासवर्ड सफलतापूर्वक बदल गया! अब आप लॉगिन कर सकते हैं।', 'success');
//         setTimeout(() => this.closeForgotModal(), 2500);
//       },
//       error: (err) => {
//         this.isPopupLoading = false;
//         this.isPopupError = false;
//         this.popupMessage = `❌ पासवर्ड रीसेट करने में समस्या हुई!\nकृपया दोबारा प्रयास करें।`;
//         this.toastService.show(
//           '❌ पासवर्ड रीसेट नहीं हो पाया। कृपया फिर से कोशिश करें।',
//           'error'
//         );
//         setTimeout(() => this.closeForgotModal(), 2500);
//       }
//     });
//   }

//   private saveSession(token: string, user: any) {
//     sessionStorage.setItem('token', token);
//     sessionStorage.setItem('email', user.email);
//     sessionStorage.setItem('phone', user.phone);
//     sessionStorage.setItem('userId', user._id);
//     sessionStorage.setItem('activeTripId', user.activeTripId || '');

//     this.syncWithAndroid(token , user.id, user.email, user.phone, user.activeTripId || '');
//     this.socketService.connectSocket();
//   }

//   openForgotModal() { this.isForgotPopupOpen = true; this.forgotEmail = ''; this.forgotNewPassword = ''; this.popupMessage = ''; }
//   closeForgotModal() { this.isForgotPopupOpen = false; }

//   private syncWithAndroid(token: string, userId: string, email: string, phone: string, activeTripId: string) {
//     const authData = {
//       token: token,
//       userId: userId,
//       email: email,
//       phone: phone,
//       activeTripId: activeTripId
//     };

//     // चैक करें कि क्या 'MyAppBridge' नाम का एंड्रॉइड इंटरफ़ेस उपलब्ध है
//     if ((window as any).MyAppBridge && typeof (window as any).MyAppBridge.updateAuthSession === 'function') {
//       (window as any).MyAppBridge.updateAuthSession(JSON.stringify(authData));
//       console.log('🟢 Auth data sent to Android via WebView Bridge');
//     } else {
//       console.log('🌐 Standard Web Browser Mode: App bridge container not detected.');
//     }
//   }
// }


import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
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

  // 1. जब भी लॉगिन पेज लोड होगा, यह चेक करेगा कि यूजर पहले से लॉगइन्ड है या नहीं
  ngOnInit() {
    const savedToken = localStorage.getItem('token');
    const savedUserId = localStorage.getItem('userId');

    if (savedToken && savedUserId) {
      console.log('🟢 Auto-login detected: User is already logged in.');
      
      // सॉकेट कनेक्शन दोबारा चालू करें
      this.socketService.connectSocket();

      // एंड्रॉइड को दोबारा डेटा भेजें (ताकि ऐप सिंक रहे)
      this.syncWithAndroid(
        savedToken,
        savedUserId,
        localStorage.getItem('email') || '',
        localStorage.getItem('phone') || '',
        localStorage.getItem('activeTripId') || ''
      );

      // सीधे होम पेज पर भेजें
      this.router.navigate(['/home']);
    }
  }

  onLogin() {
    const payload = { email: this.email, password: this.password };
    
    this.authService.login(payload).subscribe({
      next: (res: any) => {
        this.saveSession(res.token, res.user);
        this.toastService.show('🟢 लॉगिन सफल! आपका स्वागत है।', 'success');
        this.syncWithAndroid(
          res.token, 
          res.user.id || res.user._id, 
          res.user.email, 
          res.user.phone || '', 
          res.user.activeTripId || ''
        );
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

  // 2. sessionStorage को बदलकर localStorage किया गया ताकि डेटा डिलीट न हो
  private saveSession(token: string, user: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('email', user.email);
    localStorage.setItem('phone', user.phone || '');
    localStorage.setItem('userId', user.id || user._id);
    localStorage.setItem('activeTripId', user.activeTripId || '');

    this.syncWithAndroid(token , user.id || user._id, user.email, user.phone || '', user.activeTripId || '');
    this.socketService.connectSocket();
  }

  openForgotModal() { this.isForgotPopupOpen = true; this.forgotEmail = ''; this.forgotNewPassword = ''; this.popupMessage = ''; }
  closeForgotModal() { this.isForgotPopupOpen = false; }

  private syncWithAndroid(token: string, userId: string, email: string, phone: string, activeTripId: string) {
    const authData = {
      token: token,
      userId: userId,
      email: email,
      phone: phone,
      activeTripId: activeTripId
    };

    if ((window as any).MyAppBridge && typeof (window as any).MyAppBridge.updateAuthSession === 'function') {
      (window as any).MyAppBridge.updateAuthSession(JSON.stringify(authData));
      console.log('🟢 Auth data sent to Android via WebView Bridge');
    } else {
      console.log('🌐 Standard Web Browser Mode: App bridge container not detected.');
    }
  }
}


// इसे अपने Logout वाले फंक्शन में डालें (जहां भी आपने लॉगआउट बनाया हो)
// logout() {
//   localStorage.removeItem('token');
//   localStorage.removeItem('email');
//   localStorage.removeItem('phone');
//   localStorage.removeItem('userId');
//   localStorage.removeItem('activeTripId');
  
//   // अगर एंड्रॉइड को भी बताना है कि लॉगआउट हो गया है:
//   if ((window as any).MyAppBridge && typeof (window as any).MyAppBridge.updateAuthSession === 'function') {
//     (window as any).MyAppBridge.updateAuthSession(JSON.stringify(null)); 
//   }

//   this.router.navigate(['/login']);
// }