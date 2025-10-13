import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllMainFeaturesComponent } from './all-main-features.component';

describe('AllMainFeaturesComponent', () => {
  let component: AllMainFeaturesComponent;
  let fixture: ComponentFixture<AllMainFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllMainFeaturesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllMainFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
