import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  tabName: string = '';
  selectedActionTab: string = 'entry';

  switchTab(tab: string) {
    console.log("this is console for the output....")
    this.tabName = tab;
  }
  openQuickAction(actionType: 'entry' | 'voice' | 'mitra' | 'trip') {
    this.selectedActionTab = actionType;
    this.tabName = 'quick-action';
  }
  closeDrawer() {
    this.tabName = ''; 
  }
}
