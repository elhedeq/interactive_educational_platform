import { Component } from '@angular/core';
import { AuthRoutingModule } from "../../auth/auth-routing.module";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-userprofile',
  standalone: true,
  imports: [AuthRoutingModule,RouterModule],
  templateUrl: './userprofile.component.html',
  styleUrl: './userprofile.component.css'
})
export class UserprofileComponent {
  logout(){

}

}
