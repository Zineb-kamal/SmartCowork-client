// src/app/shared/language-selector/language-selector.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../core/services/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="language-selector">
      <div class="selector-container">
        <button 
          (click)="setLanguage('fr')" 
          [class.active]="currentLang === 'fr'"
          class="lang-btn">

          <span>FR</span>
        </button>
        <button 
          (click)="setLanguage('en')" 
          [class.active]="currentLang === 'en'"
          class="lang-btn">

          <span>EN</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .language-selector {
      position: relative;
    }
    
    .selector-container {
      display: flex;
      gap: 8px;
      padding: 6px;
      border-radius: 30px;
      background-color: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(26, 135, 84, 0.2);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }
    
    .lang-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 5px 12px;
      background: transparent;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      color: #555;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    
    .lang-btn:hover {
      background-color: rgba(26, 135, 84, 0.1);
    }
    
    .lang-btn.active {
      background-color: #1a8754;
      color: white;
      box-shadow: 0 2px 5px rgba(26, 135, 84, 0.3);
    }
    
    .flag-icon {
      width: 20px;
      height: 15px;
      border-radius: 2px;
      object-fit: cover;
    }
  `]
})
export class LanguageSelectorComponent implements OnInit {
  currentLang: string = 'fr';

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.currentLang = this.languageService.getCurrentLang();
    this.languageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });
  }

  setLanguage(lang: string): void {
    this.languageService.setLanguage(lang);
  }
}