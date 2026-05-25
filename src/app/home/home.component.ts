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



// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { SocketService } from '../../services/socket.service';
// import { Subscription } from 'rxjs';

// @Component({
//   selector: 'app-home',
//   templateUrl: './home.component.html',
//   styleUrls: ['./home.component.css']
// })
// export class HomeComponent implements OnInit, OnDestroy {
//   tabName: string = '';
//   selectedActionTab: string = 'entry';
  
//   // 📊 लाइव रेंडरिंग बाइंडिंग वेरिएबल्स
//   totalBalance: number = 0;
//   youWillGive: number = 0;
//   youWillGet: number = 0;
//   monthlyBudget: number = 20000;
//   spentPercentage: number = 0;
//   totalSpent: number = 0;
//   recentTransactions: any[] = [];
  
//   private socketSub!: Subscription;

//   constructor(private http: HttpClient, private socketService: SocketService) {}

//   ngOnInit() {
//     this.fetchDashboardSummary();
//     this.listenToLiveSocketUpdates();
//   }

//   // 📡 डेटाबेस से फ्रेश डेटा लोड करना
//   fetchDashboardSummary() {
//     const token = localStorage.getItem('token');
//     const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

//     this.http.get('http://localhost:5000/api/auth/dashboard-summary', { headers }).subscribe({
//       next: (data: any) => {
//         this.updateUIFields(data);
//       },
//       error: (err) => {
//         console.log("Using local mock UI data for layout engine verification.");
//         // डमी फॉलबैक डेटा यदि सर्वर टोकन अनऑथराइज्ड एरर देता है
//         this.updateUIFields({
//           totalBalance: 25480,
//           youWillGive: 4200,
//           youWillGet: 8500,
//           monthlyBudget: 20000,
//           recentTransactions: []
//         });
//       }
//     });
//   }

//   // 🔊 लाइव सॉकेट इमिट लिस्नर (बिना रिफ्रेश किए स्क्रीन अपडेट करेगा)
//   listenToLiveSocketUpdates() {
//     this.socketService.connectSocket();
//     this.socketSub = this.socketService.notification$.subscribe((newTx: any) => {
//       console.log("🟢 Live transaction received via Socket.io:", newTx);
      
//       // अनशिफ्ट करके लिस्ट में सबसे ऊपर लाइव एंट्री जोड़ना
//       this.recentTransactions.unshift({
//         merchant: newTx.merchant,
//         amount: newTx.amount,
//         type: newTx.type,
//         timestamp: newTx.timestamp
//       });

//       // लाइव कैलकुलेटर
//       if (newTx.type === 'credit') {
//         this.totalBalance += Number(newTx.amount);
//         this.youWillGet += Number(newTx.amount);
//       } else {
//         this.totalBalance -= Number(newTx.amount);
//         this.youWillGive += Number(newTx.amount);
//       }
//       this.recalculateProgressBar();
//     });
//   }

//   updateUIFields(data: any) {
//     this.totalBalance = data.totalBalance;
//     this.youWillGive = data.youWillGive;
//     this.youWillGet = data.youWillGet;
//     this.monthlyBudget = data.monthlyBudget;
//     this.recentTransactions = data.recentTransactions;
//     this.recalculateProgressBar();
//   }

//   recalculateProgressBar() {
//     this.totalSpent = this.youWillGive; 
//     this.spentPercentage = (this.totalSpent / this.monthlyBudget) * 100;
//     if(this.spentPercentage > 100) this.spentPercentage = 100;
//   }

//   switchTab(tab: string) { this.tabName = tab; }
//   openQuickAction(actionType: 'entry' | 'voice' | 'mitra' | 'trip') {
//     this.selectedActionTab = actionType;
//     this.tabName = 'quick-action';
//   }
//   closeDrawer() { this.tabName = ''; }

//   ngOnDestroy() {
//     if (this.socketSub) this.socketSub.unsubscribe();
//   }
// }
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { SocketService } from '../../services/socket.service';
import { ToastService } from '../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  // नेविगेशन और ड्रॉअर स्टेट्स
  currentTab: string = 'home'; 
  tabName: string = ''; 
  selectedActionTab: string = 'entry';

  // लाइव कार्ड वेरिएबल्स
  totalBalance: number = 0;
  youWillGive: number = 0;
  youWillGet: number = 0;
  monthlyBudget: number = 20000;
  spentPercentage: number = 0;
  totalSpent: number = 0;
  activeTripId: string = 'trip_goa_2026';
  recentTransactions: any[] = [];

  // फॉर्म इनपुट्स
  entryAmount: number | null = null;
  entryMerchant: string = '';
  entryType: string = 'debit';

  tripName: string = '';
  tripDestination: string = '';
  tripBudget: number | null = null;

  private socketSub!: Subscription;

  constructor(
    private dashboardService: DashboardService,
    private socketService: SocketService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadDashboard();
    this.initLiveSocket();
  }

  loadDashboard() {
    this.dashboardService.getSummary().subscribe({
      next: (res: any) => {
        this.totalBalance = res.totalBalance;
        this.youWillGive = res.youWillGive;
        this.youWillGet = res.youWillGet;
        this.monthlyBudget = res.monthlyBudget;
        this.activeTripId = res.activeTripId;
        this.recentTransactions = res.recentTransactions;
        this.recalculateProgress();
      },
      error: () => this.toastService.show('❌ डैशबोर्ड डेटा लोड करने में समस्या आई', 'error')
    });
  }

  initLiveSocket() {
    this.socketService.connectSocket();
    // सर्वर से आने वाले 'live-transaction' इवेंट को सुनें
    this.socketSub = this.socketService.notification$.subscribe((newTx: any) => {
      this.recentTransactions.unshift(newTx);
      
      if (newTx.type === 'credit') {
        this.totalBalance += Number(newTx.amount);
        this.youWillGet += Number(newTx.amount);
      } else {
        this.totalBalance -= Number(newTx.amount);
        this.youWillGive += Number(newTx.amount);
      }
      this.recalculateProgress();
      this.toastService.show(`🟢 नया ट्रांजैक्शन सिंक हुआ: ₹${newTx.amount}`, 'success');
    });
  }

  submitEntry() {
    if (!this.entryAmount || !this.entryMerchant) {
      this.toastService.show('⚠️ कृपया राशि और मर्चेंट का नाम भरें', 'error');
      return;
    }
    const payload = { amount: this.entryAmount, merchant: this.entryMerchant, type: this.entryType, activeTripId: this.activeTripId };
    
    this.dashboardService.addManualEntry(payload).subscribe({
      next: () => {
        this.toastService.show('🟢 एंट्री सफलतापूर्वक सुरक्षित की गई', 'success');
        this.closeDrawer();
        this.loadDashboard();
        this.resetEntryForm();
      }
    });
  }

  submitTrip() {
    if (!this.tripName || !this.tripBudget) {
      this.toastService.show('⚠️ ट्रिप का नाम और बजट आवश्यक है', 'error');
      return;
    }
    const payload = { tripName: this.tripName, destination: this.tripDestination || 'Goa', budget: this.tripBudget };
    
    this.dashboardService.createNewTrip(payload).subscribe({
      next: () => {
        this.toastService.show('🚀 नया ट्रिप एक्टिवेट कर दिया गया है', 'success');
        this.closeDrawer();
        this.loadDashboard();
      }
    });
  }

  recalculateProgress() {
    this.totalSpent = this.youWillGive;
    this.spentPercentage = (this.totalSpent / this.monthlyBudget) * 100;
    if (this.spentPercentage > 100) this.spentPercentage = 100;
  }

  // हेल्पर्स
  switchFooterTab(tab: string) { this.currentTab = tab; }
  openQuickAction(actionType: 'entry' | 'voice' | 'mitra' | 'trip') { this.selectedActionTab = actionType; this.tabName = 'quick-action'; }
  closeDrawer() { this.tabName = ''; }
  resetEntryForm() { this.entryAmount = null; this.entryMerchant = ''; }

  ngOnDestroy() {
    if (this.socketSub) this.socketSub.unsubscribe();
  }
}