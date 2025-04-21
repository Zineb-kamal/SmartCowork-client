// src/app/core/services/popup.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  // Start with popup hidden
  private contactPopupVisibleSubject = new BehaviorSubject<boolean>(false);
  contactPopupVisible$ = this.contactPopupVisibleSubject.asObservable();
  
  showContactPopup(): void {
    console.log('PopupService: Showing contact popup');
    this.contactPopupVisibleSubject.next(true);
  }
  
  hideContactPopup(): void {
    console.log('PopupService: Hiding contact popup');
    this.contactPopupVisibleSubject.next(false);
  }
}