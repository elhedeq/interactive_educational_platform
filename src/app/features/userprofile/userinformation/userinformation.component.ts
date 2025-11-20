import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-userinformation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './userinformation.component.html',
  styleUrl: './userinformation.component.css'
})
export class UserinformationComponent implements OnInit {
  http = inject(HttpClient);
  first_name='';
  last_name='';
  email='';
  bio='';
  birthdate!:Date;
  id=0;
  dayselected: number | null = null; 
  selectedmonth: number | null = null;
  selectedyear: number | null = null;

  days=Array.from({length:31},(_,i)=>(i+1))
  
  months = [
    { name: 'January', value: 1 },
    { name: 'February', value: 2 },
    { name: 'March', value: 3 },
    { name: 'April', value: 4 },
    { name: 'May', value: 5 },
    { name: 'June', value: 6 },
    { name: 'July', value: 7 },
    { name: 'August', value: 8 },
    { name: 'September', value: 9 },
    { name: 'October', value: 10 },
    { name: 'November', value: 11 },
    { name: 'December', value: 12 }
  ];
  

  years:number[]=[]
  currentyear!:number;
  startyear!:number;
  ngOnInit(): void {

    this.currentyear=new Date().getFullYear();
    this.startyear=this.currentyear- 90;

    for (let y = this.currentyear; y >= this.startyear; y--) {
      this.years.push(y)
    }

    this.http.get('http://localhost/backend/api.php/users/me')
    .subscribe({
      next:(data:any)=>{
        this.id=data.id
        this.first_name=data.first_name
        this.last_name=data.last_name
        this.email=data.email
        this.bio=data.bio
        // Only set date if data.birth_date exists
          if (data.birth_date || data.birthdate) { // Check which field name your DB uses
            const dateStr = data.birth_date || data.birthdate; 
            this.birthdate = new Date(dateStr);
             
            this.dayselected = this.birthdate.getDate();
            this.selectedmonth = this.birthdate.getMonth() + 1;
            this.selectedyear = this.birthdate.getFullYear();
          }
      },
      error:(err)=>{
        console.log('Error getting user info',err);
      }
    })

  }

  saveChanges(){
    if (!this.selectedyear || !this.selectedmonth || !this.dayselected) {
        console.error("Date incomplete");
        return;
    }

    const updatedBirthdate = new Date(
      this.selectedyear,
      this.selectedmonth - 1,
      this.dayselected
    );
    
    const formattedDate = `${this.selectedyear}-${String(this.selectedmonth).padStart(2, '0')}-${String(this.dayselected).padStart(2, '0')}`;
    const updatedData = {
      first_name: this.first_name,
      last_name: this.last_name,
      email: this.email,
      bio: this.bio,
      birth_date: formattedDate
    };
    this.http.put(`http://localhost/backend/api.php/users/${this.id}`, updatedData)
    .subscribe({
      next:(response)=>{
        console.log('User information updated successfully',response);
      },
      error:(err)=>{
        console.log('Error updating user information',err);
      }
    });
  }

}
