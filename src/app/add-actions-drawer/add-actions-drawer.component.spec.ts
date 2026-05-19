import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddActionsDrawerComponent } from './add-actions-drawer.component';

describe('AddActionsDrawerComponent', () => {
  let component: AddActionsDrawerComponent;
  let fixture: ComponentFixture<AddActionsDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddActionsDrawerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddActionsDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
