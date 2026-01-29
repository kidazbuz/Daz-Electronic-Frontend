import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { completedGuard } from './completed-guard';

describe('completedGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => completedGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
