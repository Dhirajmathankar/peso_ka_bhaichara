import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebSocketService } from '../../services/web-socket.service';
import { Subscription } from 'rxjs';


interface TodayTransaction {
  id: string;
  title: string;
  time: string;
  amount: number;
  type: 'in' | 'out'; // in = आया (Credit), out = गया (Debit)
  icon: string;
  iconColor: string;
  status: 'clean' | 'will-get' | 'will-give'; // टैगिंग स्टेट
}

@Component({
  selector: 'app-daily-report',
  templateUrl: './daily-report.component.html',
  styleUrls: ['./daily-report.component.css']
})
export class DailyReportComponent implements OnInit {

  todaySummary = {
    totalIn: 3400,
    totalOut: 1200,
    highestAmount: 1200,
    highestTransactionName: 'Ration Wholesale'
  };
  private navSub!: Subscription;
  
  // पुरानी एरे जो हमने बनाई थी
  // todayTransactions: any[] = [];
  // आज के लाइव ट्रांजैक्शंस का डेटा
  todayTransactions: TodayTransaction[] = [
    {
      id: 'tx1',
      title: 'Ration Wholesale',
      time: '10:30 AM',
      amount: 1200,
      type: 'in',
      icon: 'shopping_cart',
      iconColor: 'text-orange-400',
      status: 'clean'
    },
    {
      id: 'tx2',
      title: 'Petrol Pump',
      time: '09:15 AM',
      amount: 850,
      type: 'out',
      icon: 'local_gas_station',
      iconColor: 'text-blue-400',
      status: 'clean'
    },
    {
      id: 'tx3',
      title: 'Shyam Soni (Chai)',
      time: '02:45 PM',
      amount: 150,
      type: 'out',
      icon: 'local_cafe',
      iconColor: 'text-yellow-500',
      status: 'clean'
    }
  ];

  constructor(private wsService: WebSocketService) { }

  ngOnInit(): void { 
    // मान लेते हैं कि करंट यूजर की आईडी 'user_dhiraj_123' है
    this.wsService.connect('user_dhiraj_123', 'trip_goa_2026');

    // लाइव सॉकेट स्ट्रीम को सुनना
    this.navSub = this.wsService.notification$.subscribe((liveTx) => {
      
      // नया लाइव ट्रांजैक्शन ऑब्जेक्ट जो सीधे फोन के नोटिफिकेशन से आया है
      const formattedTx : any = {
        id: 'tx_' + Date.now(),
        title: liveTx.merchant !== 'Unknown' ? liveTx.merchant : liveTx.title,
        time: new Date(liveTx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amount: liveTx.amount || 0,
        type: liveTx.rawBody.toLowerCase().includes('received') ? 'in' : 'out',
        icon: 'notifications_active',
        iconColor: 'text-emerald-400',
        status: 'clean' // डिफ़ॉल्ट 'Clean Cash' रहेगा जब तक यूजर टैग न करे
      };

      // आज की लिस्ट में सबसे ऊपर लाइव पुश करें (UI अपने आप चमकेगा!)
      this.todayTransactions.unshift(formattedTx);
      
      // आज का टोटल लाइव कैलकुलेटर अपडेट करें
      if (formattedTx.type === 'in') {
        this.todaySummary.totalIn += formattedTx.amount;
      } else {
        this.todaySummary.totalOut += formattedTx.amount;
      }
    });
  }

  // ट्रांजैक्शन को उधारी या क्लीन कैश में टैग करने का फ़ंक्शन
  tagTransaction(txId: string, newStatus: 'clean' | 'will-get' | 'will-give') {
    const tx = this.todayTransactions.find(t => t.id === txId);
    if (tx) {
      tx.status = newStatus;
      // यहाँ आप बैकएंड API हिट करके MongoDB में 'isUdhar' या 'ledgerType' अपडेट कर सकते हैं
      console.log(`Transaction ${txId} tagged as ${newStatus}`);
    }
  }

  ngOnDestroy() {
    if (this.navSub) this.navSub.unsubscribe();
  }
}