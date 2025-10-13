import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsResoursesComponent } from './news-resourses.component';

describe('NewsResoursesComponent', () => {
  let component: NewsResoursesComponent;
  let fixture: ComponentFixture<NewsResoursesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsResoursesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewsResoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
