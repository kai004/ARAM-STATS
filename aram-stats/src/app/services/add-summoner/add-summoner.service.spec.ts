import { TestBed } from '@angular/core/testing';

import { AddSummonerService } from './add-summoner.service';

describe('AddSummonerService', () => {
  let service: AddSummonerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddSummonerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
