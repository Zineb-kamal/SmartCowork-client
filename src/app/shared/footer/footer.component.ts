// src/app/shared/footer/footer.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  emailAddress: string = '';
  
  constructor() { }

  ngOnInit(): void {
  }
  
  subscribeToNewsletter(): void {
    // Here you would implement the newsletter subscription logic
    if (this.isValidEmail(this.emailAddress)) {
      console.log('Subscribing email:', this.emailAddress);
      // Call your subscribe service here
      this.emailAddress = '';
      // Show success message
      alert('Thank you for subscribing!');
    } else {
      // Show error message
      alert('Please enter a valid email address');
    }
  }
  
  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
  
  openChat(): void {
    // Here you would implement the chat opening logic
    console.log('Opening chat window');
    // For example, toggle a chat component's visibility
  }
}