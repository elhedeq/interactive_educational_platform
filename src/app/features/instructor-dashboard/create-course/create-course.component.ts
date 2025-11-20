import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-course.component.html',
  styleUrl: './create-course.component.css'
})
export class CreateCourseComponent {
  name: string = '';
  description: string = '';
  price: number | null = null;
  category: string = '';
}
