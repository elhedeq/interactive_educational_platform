import { Component } from '@angular/core';
import { AuthRoutingModule } from "../../auth/auth-routing.module";
import {router}

@Component({
  selector: 'app-userprofile',
  standalone: true,
  imports: [AuthRoutingModule],
  templateUrl: './userprofile.component.html',
  styleUrl: './userprofile.component.css'
})
export class UserprofileComponent {
  logout(){

}

}
