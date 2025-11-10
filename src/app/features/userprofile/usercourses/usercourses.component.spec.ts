import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsercoursesComponent } from './usercourses.component';

describe('UsercoursesComponent', () => {
  let component: UsercoursesComponent;
  let fixture: ComponentFixture<UsercoursesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsercoursesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UsercoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
