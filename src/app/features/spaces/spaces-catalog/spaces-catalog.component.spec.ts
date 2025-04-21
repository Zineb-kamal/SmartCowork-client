import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpacesCatalogComponent } from './spaces-catalog.component';

describe('SpacesCatalogComponent', () => {
  let component: SpacesCatalogComponent;
  let fixture: ComponentFixture<SpacesCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpacesCatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpacesCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
