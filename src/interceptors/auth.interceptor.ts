// import { Injectable } from '@angular/core';
// import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
// import { Observable } from 'rxjs';

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {
//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     const token = localStorage.getItem('token');
// 	console.log("Hello This.................. ===." , token )

//     // यदि लोकलस्टोरेज में टोकन है, तो क्लोन करके हेडर अटैच करें
//    if (token && token !== 'undefined' && token !== 'null') {
//       const clonedReq = req.clone({
//         headers: req.headers.set('Authorization', `Bearer ${token}`)
//       });
//       return next.handle(clonedReq);
//     }

//     return next.handle(req);
//   }
// }


import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    
    console.log("=== Interceptor Token Check ===", token);

    // 1. अगर रिक्वेस्ट लॉगिन (login) या पासवर्ड भूलने (forgot-password) की है, 
    // तो उसमें जबरदस्ती टोकन अटैच करने की जरूरत नहीं है।
    if (req.url.includes('/login') || req.url.includes('/forgot-password')) {
      return next.handle(req);
    }

    // 2. टोकन को अच्छे से वैलिडेट करें (null, undefined, "null", "undefined" सबको हैंडल करेगा)
    if (token && token !== null && token !== undefined && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
      
      console.log("🟢 Valid Token Found! Attaching to headers...");
      
      const clonedReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      
      return next.handle(clonedReq);
    }

    // 3. अगर कोई टोकन नहीं मिला या इनवैलिड मिला
    console.log("⚠️ No Valid Token Found. Sending request without Authorization header.");
    return next.handle(req);
  }
}