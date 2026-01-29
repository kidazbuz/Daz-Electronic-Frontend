import { TestBed } from '@angular/core/testing';

import { ProductManager } from './product-manager';

describe('ProductManager', () => {
  let service: ProductManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
