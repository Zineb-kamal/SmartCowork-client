import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceFormsComponent } from './space-forms.component';

describe('SpaceFormsComponent', () => {
  let component: SpaceFormsComponent;
  let fixture: ComponentFixture<SpaceFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpaceFormsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpaceFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
