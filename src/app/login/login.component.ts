// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.css']
// })
// export class LoginComponent {

// }

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; 


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    const payload = { email: this.email, password: this.password };
    
    this.http.post('https://backend-api-0m05.onrender.com/api/login', payload).subscribe({
      next: (res: any) => {
        // 💾 1. वेब ब्राउज़र/लोकल स्टोरेज के लिए डेटा सेव करना
        localStorage.setItem('token', res.token);
        localStorage.setItem('email', res.user.email);
        localStorage.setItem('phone', res.user.phone);
        localStorage.setItem('userId', res.user._id);
        localStorage.setItem('activeTripId', res.user.activeTripId || '');

        // 🚀 2. यहाँ पर लगाया भाई! एंड्रॉइड कोटलिन (WebView) को लाइव डेटा भेजना
        if ((window as any).AndroidBridge) {
          (window as any).AndroidBridge.saveUserData(
            res.user._id,
            res.user.email,
            res.user.phone,
            res.user.activeTripId || ''
          );
          console.log('🚀 डेटा सफलतापूर्वक एंड्रॉइड ब्रिज को भेज दिया गया है!');
        }

        // 🔄 3. लॉगिन के बाद होम स्क्रीन पर नेविगेट करना
        this.router.navigate(['/home']);
      },
      error: (err) => {
         this.router.navigate(['/home']);
        console.error('Login Failed', err);
        alert('लॉगिन फेल हो गया! कृपया ईमेल और पासवर्ड चेक करें।');
      }
    });
  }
}