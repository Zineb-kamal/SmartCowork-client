// src/app/admin/message-list/message-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ContactMessage {
  name: string;
  email: string;
  phone?: string;
  message: string;
  timestamp: string;
}

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-container">
      <h1>Messages reçus</h1>
      
      <div *ngIf="messages.length === 0" class="no-messages">
        Aucun message reçu pour le moment.
      </div>
      
      <div *ngIf="messages.length > 0" class="message-list">
        <div *ngFor="let message of messages; let i = index" class="message-card">
          <div class="message-header">
            <h3>{{ message.name }}</h3>
            <span class="timestamp">{{ message.timestamp | date:'dd/MM/yyyy HH:mm' }}</span>
          </div>
          
          <div class="message-details">
            <p><strong>Email:</strong> {{ message.email }}</p>
            <p *ngIf="message.phone"><strong>Téléphone:</strong> {{ message.phone }}</p>
            <p class="message-content">{{ message.message }}</p>
          </div>
          
          <div class="message-actions">
            <button (click)="deleteMessage(i)" class="delete-btn">Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [/* Styles... */]
})
export class MessageListComponent implements OnInit {
  messages: ContactMessage[] = [];
  
  ngOnInit() {
    this.loadMessages();
  }
  
  loadMessages() {
    try {
      const storedMessages = localStorage.getItem('contactSubmissions');
      if (storedMessages) {
        this.messages = JSON.parse(storedMessages);
        // Trier par date (plus récent en premier)
        this.messages.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      }
    } catch (e) {
      console.error('Error loading messages', e);
    }
  }
  
  deleteMessage(index: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce message?')) {
      this.messages.splice(index, 1);
      localStorage.setItem('contactSubmissions', JSON.stringify(this.messages));
    }
  }
}