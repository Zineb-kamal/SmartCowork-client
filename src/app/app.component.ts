import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/footer/footer.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from "./shared/header.component";
import { PopupService } from './core/services/popup.service';
import { ContactPopupComponent } from './shared/contact-popup/contact-popup.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FooterComponent,
    TranslateModule,
    HeaderComponent,
    ContactPopupComponent,
  ],
  template: `
    <app-header></app-header>
    
    <main>
      <router-outlet></router-outlet>
    </main>
    
    <app-footer></app-footer>

    <!-- The contact popup component -->
    <app-contact-popup (close)="onPopupClose()"></app-contact-popup>
  `,
  styles: [`
    main {
      min-height: calc(100vh - 120px);
    }
    
    .footer {
      background-color: #f5f5f5;
      padding: 1.5rem;
      text-align: center;
      margin-top: 2rem;
    }
  `]
})
export class AppComponent implements OnInit {
  constructor(
    private translateService: TranslateService,
    private popupService: PopupService
  ) {
    // Set default language
    translateService.setDefaultLang('fr');
    
    // Use default language or saved language from localStorage
    const savedLang = localStorage.getItem('selectedLanguage');
    translateService.use(savedLang || 'fr');
  }

  ngOnInit() {
    console.log('AppComponent: Initializing');
  }

  onPopupClose() {
    console.log('AppComponent: Popup close event received');
    this.popupService.hideContactPopup();
  }
}