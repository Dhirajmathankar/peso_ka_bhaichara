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


// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { DashboardService } from '../services/dashboard.service';
// import { SocketService } from '../../services/socket.service';
// import { ToastService } from '../services/toast.service';
// import { Subscription } from 'rxjs';

// @Component({
//   selector: 'app-home',
//   templateUrl: './home.component.html',
//   styleUrls: ['./home.component.css']
// })
// export class HomeComponent implements OnInit, OnDestroy {
//   // नेविगेशन और ड्रॉअर स्टेट्स
//   currentTab: string = 'home'; 
//   tabName: string = ''; 
//   selectedActionTab: string = 'entry';

//   // लाइव कार्ड वेरिएबल्स (ग्लोबल)
//   totalBalance: number = 0;
//   youWillGive: number = 0;
//   youWillGet: number = 0;
//   monthlyBudget: number = 20000;
//   spentPercentage: number = 0;
//   totalSpent: number = 0;
//   activeTripName: string = 'No Active Trip';
//   activeTripId: string = '';
  
//   // 🔥 प्रोडक्शन रेडी बैंक ब्रेकडाउन और ट्रांजैक्शन्स एरे
//   banksBreakdown: any[] = [];
//   recentTransactions: any[] = [];

//   // फॉर्म इनपुट्स
//   entryAmount: number | null = null;
//   entryMerchant: string = '';
//   entryType: string = 'debit';
//   entryBank: string = 'SBI'; // डिफ़ॉल्ट सिलेक्टेड बैंक

//   tripName: string = '';
//   tripDestination: string = '';
//   tripBudget: number | null = null;

//   private socketSub!: Subscription;

//   constructor(
//     private dashboardService: DashboardService,
//     private socketService: SocketService,
//     private toastService: ToastService
//   ) {}

//   ngOnInit() {
//     this.loadDashboard();
//     this.initLiveSocket();
//   }

//   loadDashboard() {
//     this.dashboardService.getSummary().subscribe({
//       next: (res: any) => {
//         if (res.status === 'success' && res.data) {
//           const wallet = res.data.walletSummary;
//           const trip = res.data.activeTrip;

//           // 1. वॉलेट समरी डेटा मैपिंग
//           this.totalBalance = wallet.totalBalance;
//           this.youWillGive = wallet.youWillGive;
//           this.youWillGet = wallet.youWillGet;
//           this.banksBreakdown = wallet.banksBreakdown || [];

//           // 2. एक्टिव ट्रिप मैपिंग
//           if (trip) {
//             this.activeTripId = trip.id;
//             this.activeTripName = trip.tripName;
//             this.monthlyBudget = trip.budget || 20000; // ट्रिप का बजट ही मंथली बजट का काम करेगा
//           } else {
//             this.activeTripName = 'Personal Account';
//             this.monthlyBudget = 20000;
//           }

//           // 3. ट्रांजैक्शन मैपिंग
//           this.recentTransactions = res.data.todayTransactions || [];
//           this.recalculateProgress();
//         }
//       },
//       error: () => this.toastService.show('❌ डैशबोर्ड डेटा लोड करने में समस्या आई', 'error')
//     });
//   }

//   initLiveSocket() {
//     this.socketService.connectSocket();
    
//     this.socketSub = this.socketService.notification$.subscribe((newTx: any) => {
//       // नए ट्रांजैक्शन को सबसे ऊपर जोड़ें
//       const mappedTx = {
//         id: newTx._id || newTx.id,
//         bankName: (newTx.bankName || 'CASH').toUpperCase(),
//         type: newTx.type,
//         amount: Number(newTx.amount),
//         message: newTx.message || 'Live Transaction',
//         time: newTx.createdAt || new Date()
//       };
      
//       this.recentTransactions.unshift(mappedTx);
      
//       // 🔄 रियल-टाइम लाइव बैंक वाइज बैलेंस कैलकुलेशन कैलकुलेटर
//       const amount = Number(mappedTx.amount);
//       const isCredit = mappedTx.type === 'credit';

//       if (isCredit) {
//         this.totalBalance += amount;
//         this.youWillGet += amount;
//       } else {
//         this.totalBalance -= amount;
//         this.youWillGive += amount;
//       }

//       // स्पेसिफिक बैंक का लाइव बैलेंस अपडेट करें
//       const targetBank = this.banksBreakdown.find(b => b.bankName === mappedTx.bankName);
//       if (targetBank) {
//         if (isCredit) {
//           targetBank.balance += amount;
//           targetBank.totalIn += amount;
//         } else {
//           targetBank.balance -= amount;
//           targetBank.totalOut += amount;
//         }
//       } else {
//         // अगर नया बैंक है तो एरे में पुश कर दें
//         this.banksBreakdown.push({
//           bankName: mappedTx.bankName,
//           balance: isCredit ? amount : -amount,
//           totalIn: isCredit ? amount : 0,
//           totalOut: isCredit ? 0 : amount
//         });
//       }

//       this.recalculateProgress();
//       this.toastService.show(`🟢 ${mappedTx.bankName} में नया ट्रांजैक्शन: ₹${amount}`, 'success');
//     });
//   }

//   submitEntry() {
//     if (!this.entryAmount || !this.entryMerchant) {
//       this.toastService.show('⚠️ कृपया राशि और मर्चेंट का नाम भरें', 'error');
//       return;
//     }
//     const payload = { 
//       amount: this.entryAmount, 
//       merchant: this.entryMerchant, 
//       type: this.entryType, 
//       bankName: this.entryBank, // 🔥 बैंक नाम भी साथ भेजें
//       activeTripId: this.activeTripId 
//     };
    
//     this.dashboardService.addManualEntry(payload).subscribe({
//       next: () => {
//         this.toastService.show('🟢 एंट्री सफलतापूर्वक सुरक्षित की गई', 'success');
//         this.closeDrawer();
//         this.loadDashboard();
//         this.resetEntryForm();
//       }
//     });
//   }

//   submitTrip() {
//     if (!this.tripName || !this.tripBudget) {
//       this.toastService.show('⚠️ ट्रिप का नाम और बजट आवश्यक है', 'error');
//       return;
//     }
//     const payload = { tripName: this.tripName, destination: this.tripDestination || 'Goa', budget: this.tripBudget };
    
//     this.dashboardService.createNewTrip(payload).subscribe({
//       next: () => {
//         this.toastService.show('🚀 नया ट्रिप एक्टिवेट कर दिया गया है', 'success');
//         this.closeDrawer();
//         this.loadDashboard();
//       }
//     });
//   }

//   recalculateProgress() {
//     this.totalSpent = this.youWillGive;
//     this.spentPercentage = this.monthlyBudget > 0 ? (this.totalSpent / this.monthlyBudget) * 100 : 0;
//     if (this.spentPercentage > 100) this.spentPercentage = 100;
//   }

//   // हेल्पर्स
//   switchFooterTab(tab: string) { this.currentTab = tab; }
//   openQuickAction(actionType: 'entry' | 'voice' | 'mitra' | 'trip') { this.selectedActionTab = actionType; this.tabName = 'quick-action'; }
//   closeDrawer() { this.tabName = ''; }
//   resetEntryForm() { this.entryAmount = null; this.entryMerchant = ''; this.entryBank = 'SBI'; }

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

  // लाइव कार्ड वेरिएबल्स (ग्लोबल)
  totalBalance: number = 0;
  youWillGive: number = 0;
  youWillGet: number = 0;
  monthlyBudget: number = 20000;
  spentPercentage: number = 0;
  totalSpent: number = 0;
  activeTripName: string = 'No Active Trip';
  activeTripId: string = '';
  
  // 🔥 प्रोडक्शन रेडी बैंक ब्रेकडाउन और ट्रांजैक्शन्स एरे
  banksBreakdown: any[] = [];
  recentTransactions: any[] = [];

  // फॉर्म इनपुट्स
  entryAmount: number | null = null;
  entryMerchant: string = '';
  entryType: string = 'debit';
  entryBank: string = 'SBI'; // डिफ़ॉल्ट सिलेक्टेड बैंक

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
        if (res.status === 'success' && res.data) {
          this.mapDashboardData(res.data);
        }
      },
      error: () => this.toastService.show('❌ डैशबोर्ड डेटा लोड करने में समस्या आई', 'error')
    });
  }

  /**
   * ⚡ NEW FUNCTION: डायरेक्ट वॉलेट और बैंक बैलेंस रिफ्रेश करने के लिए (बिना पूरा पेज लोड किए)
   * इसे तुम यूआई पर किसी भी रीफ़्रेश आइकॉन या पुल-टू-रिफ्रेश पर बाइंड कर सकते हो।
   */
  refreshWalletDirectly() {
    this.dashboardService.getSummary().subscribe({
      next: (res: any) => {
        if (res.status === 'success' && res.data?.walletSummary) {
          const wallet = res.data.walletSummary;
          this.totalBalance = wallet.totalBalance;
          this.youWillGive = wallet.youWillGive;
          this.youWillGet = wallet.youWillGet;
          this.banksBreakdown = wallet.banksBreakdown || [];
          this.recalculateProgress();
          this.toastService.show('🔄 बैलेंस सिंक हो गया है!', 'success');
        }
      },
      error: () => this.toastService.show('❌ लाइव सिंक फेल हुआ', 'error')
    });
  }

  /**
   * 🛠️ हेल्पर फंक्शन: बैकएंड रिस्पॉन्स को स्टेट वेरिएबल्स में मैप करने के लिए
   */
  private mapDashboardData(data: any) {
    const wallet = data.walletSummary;
    const trip = data.activeTrip;

    // 1. वॉलेट समरी डेटा मैपिंग
    this.totalBalance = wallet.totalBalance;
    this.youWillGive = wallet.youWillGive;
    this.youWillGet = wallet.youWillGet;
    this.banksBreakdown = wallet.banksBreakdown || [];

    // 2. एक्टिव ट्रिप मैपिंग
    if (trip) {
      this.activeTripId = trip.id;
      this.activeTripName = trip.tripName;
      this.monthlyBudget = trip.budget || 20000;
    } else {
      this.activeTripName = 'Personal Account';
      this.monthlyBudget = 20000;
    }

    // 3. ट्रांजैक्शन मैपिंग
    this.recentTransactions = data.todayTransactions || [];
    this.recalculateProgress();
  }

  /**
   * 🔌 अपग्रेडेड सॉकेट इंजन: अब यह फ्रंटएंड पर खुद जोड़-घटाना करने के बजाय, 
   * बैकएंड से आने वाले 100% सही और वेरीफाइड एरे को सीधा रिप्लेस करता है।
   */
  initLiveSocket() {
    this.socketService.connectSocket();
    
    this.socketSub = this.socketService.notification$.subscribe((socketPayload: any) => {
      // अगर बैकएंड से पूरा ऑब्जेक्ट आ रहा है (जैसे हमने पिछले आर्किटेक्चर में किया था)
      if (socketPayload.newTx) {
        const newTx = socketPayload.newTx;
        
        // 1. नए ट्रांजैक्शन को सबसे ऊपर जोड़ें
        const mappedTx = {
          id: newTx.id || newTx._id,
          bankName: (newTx.bankName || 'CASH').toUpperCase(),
          type: newTx.type,
          amount: Number(newTx.amount),
          message: newTx.message || 'Live Transaction',
          time: newTx.time || new Date()
        };
        this.recentTransactions.unshift(mappedTx);

        // 2. 🔥 सुपर-क्लीन बाइंडिंग: नो क्लाइंट-साइड मैथ! सीधे बैकएंड स्टेट से अपडेट करें
        this.totalBalance = socketPayload.totalNetBalance ?? this.totalBalance;
        if (socketPayload.banksBreakdown) {
          this.banksBreakdown = socketPayload.banksBreakdown;
        }

        this.recalculateProgress();
        this.toastService.show(`🟢 ${mappedTx.bankName}: ₹${mappedTx.amount} का लाइव अपडेट`, 'success');
      } else {
        // 🔄 फॉलबैक: अगर पुराना स्ट्रक्चर आ रहा हो तो ही यह लॉजिक काम करेगा
        const amount = Number(socketPayload.amount);
        const isCredit = socketPayload.type === 'credit';
        const bankName = (socketPayload.bankName || 'CASH').toUpperCase();

        const fallbackTx = {
          id: socketPayload._id || socketPayload.id,
          bankName: bankName,
          type: socketPayload.type,
          amount: amount,
          message: socketPayload.message || 'Live Transaction',
          time: socketPayload.createdAt || new Date()
        };
        this.recentTransactions.unshift(fallbackTx);

        if (isCredit) {
          this.totalBalance += amount;
        } else {
          this.totalBalance -= amount;
        }

        const targetBank = this.banksBreakdown.find(b => b.bankName === bankName);
        if (targetBank) {
          if (isCredit) {
            targetBank.balance += amount;
          } else {
            targetBank.balance -= amount;
          }
        } else {
          this.banksBreakdown.push({
            bankName: bankName,
            balance: isCredit ? amount : -amount,
            totalIn: isCredit ? amount : 0,
            totalOut: isCredit ? 0 : amount
          });
        }
        this.recalculateProgress();
      }
    });
  }

  submitEntry() {
    if (!this.entryAmount || !this.entryMerchant) {
      this.toastService.show('⚠️ कृपया राशि और मर्चेंट का नाम भरें', 'error');
      return;
    }
    const payload = { 
      amount: this.entryAmount, 
      merchant: this.entryMerchant, 
      type: this.entryType, 
      bankName: this.entryBank,
      activeTripId: this.activeTripId 
    };
    
    this.dashboardService.addManualEntry(payload).subscribe({
      next: () => {
        this.toastService.show('🟢 एंट्री सफलतापूर्वक सुरक्षित की गई', 'success');
        this.closeDrawer();
        this.loadDashboard(); // मैन्युअल एंट्री के बाद यह पूरा स्नैपशॉट दोबारा लोड कर लेगा
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
    this.spentPercentage = this.monthlyBudget > 0 ? (this.totalSpent / this.monthlyBudget) * 100 : 0;
    if (this.spentPercentage > 100) this.spentPercentage = 100;
  }

  // हेल्पर्स
  switchFooterTab(tab: string) { this.currentTab = tab; }
  openQuickAction(actionType: 'entry' | 'voice' | 'mitra' | 'trip') { this.selectedActionTab = actionType; this.tabName = 'quick-action'; }
  closeDrawer() { this.tabName = ''; }
  resetEntryForm() { this.entryAmount = null; this.entryMerchant = ''; this.entryBank = 'SBI'; }

  ngOnDestroy() {
    if (this.socketSub) this.socketSub.unsubscribe();
  }
}