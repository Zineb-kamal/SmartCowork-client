import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccupancyPredictionsComponent } from './occupancy-predictions.component';

describe('OccupancyPredictionsComponent', () => {
  let component: OccupancyPredictionsComponent;
  let fixture: ComponentFixture<OccupancyPredictionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccupancyPredictionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OccupancyPredictionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
