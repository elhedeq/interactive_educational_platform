
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
selector: 'app-checkout',
standalone: true,
templateUrl: './checkout.component.html',
styleUrls: ['./checkout.component.css'],
imports: [FormsModule, CommonModule],
})
export class CheckoutComponent {
summary = [
{ title: 'Lorem ipsum dolor sit amet', price: '$24.69', image: 'assets/img1.jpg' },
{ title: 'Second item description', price: '$24.69', image: 'assets/img2.jpg' },
];


confirmPayment() {
console.log('Payment Confirmed!');
}
}
