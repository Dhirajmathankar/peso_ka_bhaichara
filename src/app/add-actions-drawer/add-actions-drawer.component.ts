import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-actions-drawer',
  templateUrl: './add-actions-drawer.component.html',
  styleUrls: ['./add-actions-drawer.component.css']
})
export class AddActionsDrawerComponent implements OnInit {
  @Input() defaultTab: string = 'entry'; 
  @Output() closeDrawer = new EventEmitter<void>();
  activeForm: 'entry' | 'voice' | 'mitra' | 'trip' = 'entry'; 
  ngOnInit() {
    if (this.defaultTab) {
      this.activeForm = this.defaultTab as 'entry' | 'voice' | 'mitra' | 'trip';
    }
  }
}