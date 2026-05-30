import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KhataChatComponent } from './khata-chat.component';

describe('KhataChatComponent', () => {
  let component: KhataChatComponent;
  let fixture: ComponentFixture<KhataChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KhataChatComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KhataChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
