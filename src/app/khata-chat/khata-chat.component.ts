import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { KhataChatService } from '../services/khata-chat.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-khata-chat',
  templateUrl: './khata-chat.component.html', // 🎯 यहाँ .html होना चाहिए
  styleUrls: ['./khata-chat.component.css']
})
export class KhataChatComponent implements OnInit, OnDestroy {
  @Input() selectedPerson: { name: string, phone: string } | null = null;
  @Output() closeChat = new EventEmitter<void>();
  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;

  messages: any[] = [];
  typedText: string = '';
  
  // क्विक लेज़र बॉक्स टॉगल स्टेट्स
  showLedgerBox: boolean = false;
  ledgerAmount: number | null = null;
  ledgerType: 'will-get' | 'will-give' = 'will-get';
  ledgerReason: string = '';
  
  isLoading = false;
  private socketSub!: Subscription;

  constructor(
    private chatService: KhataChatService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    if (this.selectedPerson) {
      this.loadMessages();
      this.initLiveChatSocket();
    }
  }

  loadMessages() {
    this.isLoading = true;
    this.chatService.getChatHistory(this.selectedPerson!.phone).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.messages = res.data;
          this.scrollToBottom();
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  initLiveChatSocket() {
    this.socketSub = this.socketService.notification$.subscribe((msg: any) => {
      // अगर लाइव मैसेज इसी यूजर का है, तो एरे में पुश मारो
      if (msg && msg.personPhone === this.selectedPerson!.phone) {
        this.messages.push(msg);
        this.scrollToBottom();
      }
    });
  }

  // 📝 टाइप किया हुआ नॉर्मल मैसेज भेजें
  sendTextMessage() {
    if (!this.typedText.trim()) return;

    const payload = {
      personPhone: this.selectedPerson!.phone,
      messageType: 'TEXT',
      text: this.typedText.trim()
    };

    this.chatService.sendMessage(payload).subscribe({
      next: () => {
        this.typedText = '';
        this.loadMessages(); // ऑटो रिफ्रेश
      }
    });
  }

  // 💵 चैट रूम के अंदर से डायरेक्ट लेनदेन जोड़ें
  sendLedgerEntry() {
    if (!this.ledgerAmount || this.ledgerAmount <= 0) return;

    const payload = {
      personPhone: this.selectedPerson!.phone,
      messageType: 'KHATA_ENTRY',
      amount: this.ledgerAmount,
      type: this.ledgerType,
      reason: this.ledgerReason || 'Chat Transaction'
    };

    this.chatService.sendMessage(payload).subscribe({
      next: () => {
        this.ledgerAmount = null;
        this.ledgerReason = '';
        this.showLedgerBox = false;
        this.loadMessages();
      }
    });
  }

  toggleLedgerBox(type: 'will-get' | 'will-give') {
    this.ledgerType = type;
    this.showLedgerBox = !this.showLedgerBox;
  }

  scrollToBottom(): void {
    try {
      setTimeout(() => {
        this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
      }, 100);
    } catch(err) { }
  }

  goBack() {
    this.closeChat.emit();
  }

  ngOnDestroy() {
    if (this.socketSub) this.socketSub.unsubscribe();
  }
}