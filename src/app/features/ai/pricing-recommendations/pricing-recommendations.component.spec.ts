import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingRecommendationsComponent } from './pricing-recommendations.component';

describe('PricingRecommendationsComponent', () => {
  let component: PricingRecommendationsComponent;
  let fixture: ComponentFixture<PricingRecommendationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingRecommendationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PricingRecommendationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
