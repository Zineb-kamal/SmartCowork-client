import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceCreateComponent } from './space-create.component';

describe('SpaceCreateComponent', () => {
  let component: SpaceCreateComponent;
  let fixture: ComponentFixture<SpaceCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpaceCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpaceCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
