import { Component, EventEmitter, Output, HostListener } from '@angular/core';


@Component({
  selector: 'app-you-will-give',
  templateUrl: './you-will-give.component.html',
  styleUrls: ['./you-will-give.component.css']
})
export class YouWillGiveComponent {
 @Output() close = new EventEmitter<void>();
  private touchStartY = 0;
  onCloseClick() {
    this.close.emit();
  }
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartY = event.touches[0].clientY;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    const touchEndY = event.changedTouches[0].clientY;
    const diffY = touchEndY - this.touchStartY;
    if (diffY > 80) {
      this.close.emit();
    }
  }
}
