import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Course = { id: number; title: string; hours: number; price: number };

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class checkoutComponent implements OnInit {
  cardName = '';
  cardNumber = '';
  exp = '';
  cvc = '';
  total = 0;

  demoCourses: Course[] = [
    { id: 1, title: 'React - Complete Guide', hours: 18, price: 39.99 },
    { id: 2, title: 'Angular Practical Projects', hours: 12, price: 29.99 },
    { id: 3, title: 'Advanced TypeScript', hours: 8, price: 19.99 },
  ];

  ngOnInit(): void {
    this.total = this.demoCourses.reduce((sum, c) => sum + c.price, 0);
  }

  formatCardNumber(value: string): string {
    return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  }

  formatExp(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    return digits.length <= 2 ? digits : digits.slice(0, 2) + '/' + digits.slice(2);
  }

  onSubmit(): void {
    if (!this.cardName || !this.cardNumber || !this.exp || !this.cvc) {
      alert('Please fill in all fields.');
      return;
    }
    alert('Redirecting to PayPal...');
    this.initPayPalButton();
  }

  clearForm(): void {
    this.cardName = '';
    this.cardNumber = '';
    this.exp = '';
    this.cvc = '';
  }

  loadPayPalScript(): Promise<void> {
    return new Promise((resolve) => {
      if (document.getElementById('paypal-sdk')) return resolve();
      const script = document.createElement('script');
      script.id = 'paypal-sdk';
      script.src = 'https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=USD';
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  }

  async initPayPalButton(): Promise<void> {
    await this.loadPayPalScript();
    const total = this.total;

    const container = document.getElementById('paypal-button-container');
    if (!container) return;

    // @ts-ignore
    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{ amount: { value: total.toFixed(2) } }],
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          alert('Payment completed successfully by ' + details.payer.name.given_name);
        });
      },
    }).render('#paypal-button-container');
  }
}
