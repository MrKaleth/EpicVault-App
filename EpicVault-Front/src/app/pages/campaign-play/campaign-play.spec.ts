import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignPlay } from './campaign-play';

describe('CampaignPlay', () => {
  let component: CampaignPlay;
  let fixture: ComponentFixture<CampaignPlay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignPlay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignPlay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
