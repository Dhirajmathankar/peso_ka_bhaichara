import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YouWillGiveComponent } from './you-will-give.component';

describe('YouWillGiveComponent', () => {
  let component: YouWillGiveComponent;
  let fixture: ComponentFixture<YouWillGiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ YouWillGiveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YouWillGiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
