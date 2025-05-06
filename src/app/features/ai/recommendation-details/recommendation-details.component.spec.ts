import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecommendationDetailsComponent } from './recommendation-details.component';

describe('RecommendationDetailsComponent', () => {
  let component: RecommendationDetailsComponent;
  let fixture: ComponentFixture<RecommendationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecommendationDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecommendationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
