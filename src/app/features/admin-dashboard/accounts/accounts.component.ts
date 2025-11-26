import { Component, inject, OnInit } from '@angular/core';
import { NgForOf } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Notification } from '../../../services/notifications.service';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [NgForOf, FormsModule],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.css'
})
export class AccountsComponent implements OnInit{
  http = inject(HttpClient);
  notification = inject(Notification)

  users:any[]=[];
  newUser:{first_name:string, last_name:string, email:string, bio:string, credential:number; password:string} = {first_name:'',last_name:'',email:'',bio:'',credential:0,password:''};
  credential_levels = [0,1,2]

  ngOnInit(): void {
    this.http.get<any>('http://localhost/backend/api.php/users')
    .subscribe({
      next: response => {
        this.users = response;
      },
      error: err => {
        this.notification.showNotification('somthing went wrong',1000,'danger');
        console.error('error fetcing users: ',err);
      }
    });
  }

  addUser(){
    this.http.post<any>(`http://localhost/backend/api.php/users/`,this.newUser)
    .subscribe({
      next: response => {
        this.notification.showNotification('you have added a new user successfully!',1000,'success');
        this.ngOnInit();
      },
      error: err => {
        this.notification.showNotification('somthing went wrong',1000,'danger');
        console.error('error updating user data: ',err);
      }
    });
  }

  updateUser(i:number) {
    let user = this.users[i];
    this.http.put<any>(`http://localhost/backend/api.php/users/${user.id}`,user)
    .subscribe({
      next: response => {
        this.notification.showNotification('user data has been updated successfully!',1000,'success');
        this.ngOnInit();
      },
      error: err => {
        this.notification.showNotification('somthing went wrong',1000,'danger');
        console.error('error updating user data: ',err);
      }
    });
  }

  deleteUser(i:number){
    let user = this.users[i];
    this.http.delete<any>(`http://localhost/backend/api.php/users/${user.id}`)
    .subscribe({
      next: response => {
        this.notification.showNotification('user have been deleted successfully',1000, 'success');
        this.ngOnInit();
      },
      error: err => {
        this.notification.showNotification('somthing went wrong',1000,'danger');
        console.error('error deleting user: ', err);
      }
    })
  }

}
