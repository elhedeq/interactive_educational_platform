import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradeProjectsComponent } from './grade-projects.component';

describe('GradeProjectsComponent', () => {
  let component: GradeProjectsComponent;
  let fixture: ComponentFixture<GradeProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradeProjectsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GradeProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
