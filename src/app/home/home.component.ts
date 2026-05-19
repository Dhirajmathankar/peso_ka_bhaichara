import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  tabName: string = '';

  switchTab(tab: string) {
    this.tabName = tab;
  }

  closeDrawer() {
    this.tabName = ''; 
  }
}
