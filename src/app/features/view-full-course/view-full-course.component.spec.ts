import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFullCourseComponent } from './view-full-course.component';

describe('ViewFullCourseComponent', () => {
  let component: ViewFullCourseComponent;
  let fixture: ComponentFixture<ViewFullCourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewFullCourseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewFullCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
