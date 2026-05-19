import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendsHub } from './friends-hub';

describe('FriendsHub', () => {
  let component: FriendsHub;
  let fixture: ComponentFixture<FriendsHub>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendsHub]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FriendsHub);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
