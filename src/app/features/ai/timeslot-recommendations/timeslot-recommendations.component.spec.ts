import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeslotRecommendationsComponent } from './timeslot-recommendations.component';

describe('TimeslotRecommendationsComponent', () => {
  let component: TimeslotRecommendationsComponent;
  let fixture: ComponentFixture<TimeslotRecommendationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeslotRecommendationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeslotRecommendationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
