// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-home',
//   templateUrl: './home.component.html',
//   styleUrls: ['./home.component.css']
// })
// export class HomeComponent {

//   tabName: string = '';
//   selectedActionTab: string = 'entry';

//   switchTab(tab: string) {
//     console.log("this is console for the output....")
//     this.tabName = tab;
//   }
//   openQuickAction(actionType: 'entry' | 'voice' | 'mitra' | 'trip') {
//     this.selectedActionTab = actionType;
//     this.tabName = 'quick-action';
//   }
//   closeDrawer() {
//     this.tabName = ''; 
//   }
// }



import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  tabName: string = '';
  selectedActionTab: string = 'entry';
  
  // 📊 लाइव रेंडरिंग बाइंडिंग वेरिएबल्स
  totalBalance: number = 0;
  youWillGive: number = 0;
  youWillGet: number = 0;
  monthlyBudget: number = 20000;
  spentPercentage: number = 0;
  totalSpent: number = 0;
  recentTransactions: any[] = [];
  
  private socketSub!: Subscription;

  constructor(private http: HttpClient, private socketService: SocketService) {}

  ngOnInit() {
    this.fetchDashboardSummary();
    this.listenToLiveSocketUpdates();
  }

  // 📡 डेटाबेस से फ्रेश डेटा लोड करना
  fetchDashboardSummary() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get('http://localhost:5000/api/auth/dashboard-summary', { headers }).subscribe({
      next: (data: any) => {
        this.updateUIFields(data);
      },
      error: (err) => {
        console.log("Using local mock UI data for layout engine verification.");
        // डमी फॉलबैक डेटा यदि सर्वर टोकन अनऑथराइज्ड एरर देता है
        this.updateUIFields({
          totalBalance: 25480,
          youWillGive: 4200,
          youWillGet: 8500,
          monthlyBudget: 20000,
          recentTransactions: []
        });
      }
    });
  }

  // 🔊 लाइव सॉकेट इमिट लिस्नर (बिना रिफ्रेश किए स्क्रीन अपडेट करेगा)
  listenToLiveSocketUpdates() {
    this.socketService.connectSocket();
    this.socketSub = this.socketService.notification$.subscribe((newTx: any) => {
      console.log("🟢 Live transaction received via Socket.io:", newTx);
      
      // अनशिफ्ट करके लिस्ट में सबसे ऊपर लाइव एंट्री जोड़ना
      this.recentTransactions.unshift({
        merchant: newTx.merchant,
        amount: newTx.amount,
        type: newTx.type,
        timestamp: newTx.timestamp
      });

      // लाइव कैलकुलेटर
      if (newTx.type === 'credit') {
        this.totalBalance += Number(newTx.amount);
        this.youWillGet += Number(newTx.amount);
      } else {
        this.totalBalance -= Number(newTx.amount);
        this.youWillGive += Number(newTx.amount);
      }
      this.recalculateProgressBar();
    });
  }

  updateUIFields(data: any) {
    this.totalBalance = data.totalBalance;
    this.youWillGive = data.youWillGive;
    this.youWillGet = data.youWillGet;
    this.monthlyBudget = data.monthlyBudget;
    this.recentTransactions = data.recentTransactions;
    this.recalculateProgressBar();
  }

  recalculateProgressBar() {
    this.totalSpent = this.youWillGive; 
    this.spentPercentage = (this.totalSpent / this.monthlyBudget) * 100;
    if(this.spentPercentage > 100) this.spentPercentage = 100;
  }

  switchTab(tab: string) { this.tabName = tab; }
  openQuickAction(actionType: 'entry' | 'voice' | 'mitra' | 'trip') {
    this.selectedActionTab = actionType;
    this.tabName = 'quick-action';
  }
  closeDrawer() { this.tabName = ''; }

  ngOnDestroy() {
    if (this.socketSub) this.socketSub.unsubscribe();
  }
}