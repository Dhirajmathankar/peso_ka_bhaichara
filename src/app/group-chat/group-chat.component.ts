import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GroupSocketService } from '../services/group-socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-group-chat',
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.css']
})
export class GroupChatComponent implements OnInit, OnDestroy {
  @Input() currentGroup: any; // पेरेंट लिस्ट से आया हुआ ग्रुप ऑब्जेक्ट
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  messages: any[] = [];
  typedText: string = '';
  
  // एक्सपेंस बॉक्स स्टेट्स
  showExpenseModal = false;
  expenseAmount: number | null = null;
  expenseDesc: string = '';

  private msgSub!: Subscription;
  private balanceSub!: Subscription;
  myUserId = '6903b1c21d6e241b3cbc99e5'; // आपकी एक्टिव यूजर आईडी (Auth से आएगी)

  constructor(
    private http: HttpClient,
    private socketService: GroupSocketService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    if (this.currentGroup) {
      this.socketService.initSocketConnection();
      this.socketService.joinGroupRoom(this.currentGroup._id);

      this.loadGroupChatHistory();
      this.listenToLiveStreams();
    }
  }

  loadGroupChatHistory() {
    this.http.get(`http://localhost:3000/api/group/history/${this.currentGroup._id}`)
      .subscribe((res: any) => {
        this.messages = res.data;
        this.scrollToBottom();
      });
  }

  listenToLiveStreams() {
    // 📡 लाइव चैट एवं एक्सपेंस कार्ड रेंडरर
    this.msgSub = this.socketService.onNewGroupMessage.subscribe((newMsg: any) => {
      this.zone.run(() => {
        if (newMsg.groupId === this.currentGroup._id) {
          this.messages.push(newMsg);
          this.scrollToBottom();
        }
      });
    });

    // 📡 लाइव बैलेंस रिफ्रेश ट्रिगर
    this.balanceSub = this.socketService.onBalanceRefresh.subscribe((signal) => {
      this.zone.run(() => {
        console.log("🔄 नेट बैलेंस लाइव अपडेट हो गया है!");
        // यहाँ आप अपना 'Fetch Group Summary Dashboard' फंक्शन कॉल कर सकते हैं
      });
    });
  }

  // 📝 नॉर्मल टेक्स्ट सेंड
  sendText() {
    if (!this.typedText.trim()) return;
    const payload = {
      groupId: this.currentGroup._id,
      messageType: 'TEXT',
      text: this.typedText
    };
    this.http.post('http://localhost:3000/api/group/expense/send', payload).subscribe();
    this.typedText = '';
  }

  // 🌴/🏪 ग्रुप एक्सपेंस पुश (Trip/Business दोनों के लिए कॉमन UI ट्रिगर)
  submitExpense() {
    if (!this.expenseAmount || this.expenseAmount <= 0) return;

    const payload = {
      groupId: this.currentGroup._id,
      messageType: 'GROUP_EXPENSE',
      totalAmount: this.expenseAmount,
      description: this.expenseDesc,
      splitType: 'EQUAL'
    };

    this.http.post('http://localhost:3000/api/group/expense/send', payload).subscribe(() => {
      this.showExpenseModal = false;
      this.expenseAmount = null;
      this.expenseDesc = '';
    });
  }

  // 💳 लाइव नकली यूपीआई सेटलमेंट सिमुलेटर
  triggerFakeUPISettle(receiverId: string, amount: number) {
    const payload = {
      groupId: this.currentGroup._id,
      receiverId,
      amountPaid: amount,
      transactionId: 'TXN' + Math.floor(Math.random() * 100000000)
    };

    this.http.post('http://localhost:3000/api/group/payment/settle', payload).subscribe();
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 50);
  }

  ngOnDestroy() {
    if (this.msgSub) this.msgSub.unsubscribe();
    if (this.balanceSub) this.balanceSub.unsubscribe();
  }
}