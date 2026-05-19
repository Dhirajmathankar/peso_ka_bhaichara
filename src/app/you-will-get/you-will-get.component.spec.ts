import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YouWillGetComponent } from './you-will-get.component';

describe('YouWillGetComponent', () => {
  let component: YouWillGetComponent;
  let fixture: ComponentFixture<YouWillGetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ YouWillGetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YouWillGetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
