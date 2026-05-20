import { Component, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit(): void { }

  // ट्रांजैक्शन को उधारी या क्लीन कैश में टैग करने का फ़ंक्शन
  tagTransaction(txId: string, newStatus: 'clean' | 'will-get' | 'will-give') {
    const tx = this.todayTransactions.find(t => t.id === txId);
    if (tx) {
      tx.status = newStatus;
      // यहाँ आप बैकएंड API हिट करके MongoDB में 'isUdhar' या 'ledgerType' अपडेट कर सकते हैं
      console.log(`Transaction ${txId} tagged as ${newStatus}`);
    }
  }
}