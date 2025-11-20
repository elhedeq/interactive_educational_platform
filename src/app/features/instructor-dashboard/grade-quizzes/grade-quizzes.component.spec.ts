import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradeQuizzesComponent } from './grade-quizzes.component';

describe('GradeQuizzesComponent', () => {
  let component: GradeQuizzesComponent;
  let fixture: ComponentFixture<GradeQuizzesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradeQuizzesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GradeQuizzesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
