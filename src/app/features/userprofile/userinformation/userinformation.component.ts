import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-userinformation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './userinformation.component.html',
  styleUrl: './userinformation.component.css'
})
export class UserinformationComponent implements OnInit {





  days=Array.from({length:31},(_,i)=>(i+1))
 dayselected=''

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
  selectedmonth=''



  selectedyear=''
  years:number[]=[]
  currentyear!:number;
  startyear!:number;
  ngOnInit(): void {

   this.currentyear=new Date().getFullYear();
   this.startyear=this.currentyear- 90;

  for (let y = this.currentyear; y >= this.startyear; y--) {
      this.years.push(y)

  }

  }






}
