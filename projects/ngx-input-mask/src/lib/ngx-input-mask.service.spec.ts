import { TestBed } from '@angular/core/testing';

import { NgxInputMaskService } from './ngx-input-mask.service';

describe('NgxInputMaskService', () => {
  let service: NgxInputMaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxInputMaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
