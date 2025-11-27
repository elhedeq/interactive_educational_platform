import { Component } from '@angular/core';
import { AuthRoutingModule } from "../../../auth/auth-routing.module";


@Component({
  selector: 'app-main',
  standalone: true,
  imports: [AuthRoutingModule],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {

}
