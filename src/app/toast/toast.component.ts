import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastService, ToastData } from '../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-global-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit, OnDestroy {
  toastData: ToastData = { message: '', type: 'success', show: false };
  private subscription!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    // सर्विस के डेटा को सब्सक्राइब करें ताकि लाइव अपडेट्स मिलें
    this.subscription = this.toastService.toastState$.subscribe(data => {
      this.toastData = data;
    });
  }

  closeToast() {
    this.toastService.hide();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}