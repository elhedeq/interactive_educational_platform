import { Component } from '@angular/core';
import { AuthRoutingModule } from "../../auth/auth-routing.module";

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [AuthRoutingModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {

}
