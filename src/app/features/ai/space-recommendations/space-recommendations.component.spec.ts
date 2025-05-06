import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceRecommendationsComponent } from './space-recommendations.component';

describe('SpaceRecommendationsComponent', () => {
  let component: SpaceRecommendationsComponent;
  let fixture: ComponentFixture<SpaceRecommendationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpaceRecommendationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpaceRecommendationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
