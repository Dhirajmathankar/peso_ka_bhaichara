import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KhataService, KhataEntry } from '../services/khata.service';

@Component({
  selector: 'app-khata',
  templateUrl: './khata.component.html',
  styleUrls: ['./khata.component.css']
})
export class KhataComponent implements OnInit {
  khataForm!: FormGroup;
  khataSummary: any = null;
  khataHistory: any[] = [];
  isLoading = false;
  isLoadingList = false;
  activeTripName:any ;
  
  

  // ⚡ NgZone को इंजेक्ट किया ताकि एंड्रॉइड से डेटा आते ही यूआई तुरंत अपडेट हो
  constructor(
    private fb: FormBuilder, 
    private khataService: KhataService,
    private zone: NgZone 
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadKhataDashboard();
    this.setupAndroidJavascriptInterface();
  }

  // फॉर्म को इनिशियलाइज़ करना
  initForm() {
    this.khataForm = this.fb.group({
      personName: ['', [Validators.required, Validators.minLength(2)]],
      personPhone: ['', [Validators.required, Validators.pattern('^[0-9+ ]{10,15}$')]],
      amount: ['', [Validators.required, Validators.min(1)]],
      khataType: ['will-get', Validators.required],
      reason: ['Personal', Validators.maxLength(100)],
      paymentMode: ['cash', Validators.required]
    });
  }

  // 🌐 एंड्रॉइड वेबव्यू के लिए ग्लोबल विंडो लिसनर सेट करना
  setupAndroidJavascriptInterface() {
    // एंड्रॉइड स्टूडियो का जावा कोड इसी फंक्शन को कॉल करके नाम और नंबर पास करेगा
    (window as any).handleAndroidContact = (name: string, phone: string) => {
      console.log('📥 Android Contact Received:', name, phone);
      
      // ⚡ क्रिटिकल: NgZone के अंदर फॉर्म पैच करना जरूरी है, वरना वैल्यू इनपुट बॉक्स में नहीं दिखेगी
      this.zone.run(() => {
        let cleanPhone = phone.replace(/[\s\-()]/g, '');
        if (cleanPhone.startsWith('+91')) {
          cleanPhone = cleanPhone.replace('+91', '');
        }

        this.khataForm.patchValue({
          personName: name,
          personPhone: cleanPhone
        });
      });
    };
  }

  // 👤 बटन क्लिक होने पर ट्रिगर होने वाला मैकेनिज्म
  pickMobileContact() {
    const anyWindow = window as any;

    // चेक करें कि क्या ऐप एंड्रॉइड स्टूडियो के वेबव्यू के अंदर चल रही है और ब्रिज उपलब्ध है
    if (anyWindow.AndroidBridge && typeof anyWindow.AndroidBridge.openContactPicker === 'function') {
      console.log('🤖 Android Bridge Found! Opening native contact picker...');
      anyWindow.AndroidBridge.openContactPicker();
    } else {
      console.warn('🌐 App running in standard web browser mode.');
      alert('कांटेक्ट लिस्ट केवल मोबाइल ऐप के अंदर उपलब्ध है। कृपया यहाँ मैन्युअल नाम और नंबर टाइप करें!');
    }
  }

  // डैशबोर्ड समरी और लिस्ट लोड करना
  loadKhataDashboard() {
    this.isLoadingList = true;
    this.khataService.getKhataDashboard().subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.khataSummary = res.data.summary;
          this.khataHistory = res.data.history;
        }
        this.isLoadingList = false;
      },
      error: (err) => {
        console.error('डैशबोर्ड लोड करने में विफल:', err);
        this.isLoadingList = false;
      }
    });
  }

  // फॉर्म सबमिट करना
  onSubmit() {
    if (this.khataForm.invalid) return;

    this.isLoading = true;
    const payload: KhataEntry = this.khataForm.value;

    this.khataService.addKhataEntry(payload).subscribe({
      next: (res) => {
        alert('खाता एंट्री दर्ज कर दी गई है और सामने वाले को अलर्ट भेज दिया गया है!');
        this.initForm(); // फॉर्म रीसेट करें
        this.loadKhataDashboard(); // यूआई लिस्ट रिफ्रेश करें
        this.isLoading = false;
      },
      error: (err) => {
        console.error('सेว करने में त्रुटि:', err);
        alert('डेटाबेस सिंक फेल हुआ, कृपया दोबारा जांचें।');
        this.isLoading = false;
      }
    });
  }
  // khata.component.ts के अंदर कहीं भी जोड़ें (जैसे onSubmit के नीचे):

getAvatarLetter(name: any): string {
  if (!name) return '?';
  // अगर नाम स्ट्रिंग है या कुछ और, उसे स्ट्रिंग में बदल कर पहला अक्षर निकालें
  const stringName = String(name).trim();
  return stringName ? stringName.charAt(0).toUpperCase() : '?';
}
selectedChatPerson: { name: string, phone: string } | null = null;

// क्लिक होने पर इस फंक्शन को कॉल करेंगे
openPersonalChat(name: string, phone: string) {
  this.selectedChatPerson = { name, phone };
}

closePersonalChat() {
  this.selectedChatPerson = null;
  this.loadKhataDashboard(); // चैट बंद होने पर लेज़र रिफ्रेश कर लें
}
}