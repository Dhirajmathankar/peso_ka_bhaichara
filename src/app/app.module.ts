import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { RouterModule } from '@angular/router';
import { routes } from './route/route-routing.module';
import { HomeComponent } from './home/home.component';
import { YouWillGetComponent } from './you-will-get/you-will-get.component';
import { YouWillGiveComponent } from './you-will-give/you-will-give.component';
import { AddActionsDrawerComponent } from './add-actions-drawer/add-actions-drawer.component';
import { DailyReportComponent } from './daily-report/daily-report.component';
import { FormsModule } from '@angular/forms'
import { HttpClientModule } from '@angular/common/http';
import { ToastComponent } from './toast/toast.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../interceptors/auth.interceptor';
// providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }]


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignUpComponent,
    HomeComponent,
    YouWillGetComponent,
    YouWillGiveComponent,
    AddActionsDrawerComponent,
    DailyReportComponent,
    ToastComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, { useHash: true }),
    FormsModule,
    HttpClientModule
  ],
   providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
