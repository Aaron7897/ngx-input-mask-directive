import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxInputMaskComponent } from './ngx-input-mask.component';

describe('NgxInputMaskComponent', () => {
  let component: NgxInputMaskComponent;
  let fixture: ComponentFixture<NgxInputMaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxInputMaskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxInputMaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
