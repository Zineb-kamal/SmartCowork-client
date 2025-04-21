// src/app/core/services/language.service.ts
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLangSubject = new BehaviorSubject<string>('fr');
  public currentLang$ = this.currentLangSubject.asObservable();

  constructor(private translate: TranslateService) {
    // Récupérer la langue du localStorage ou utiliser le français par défaut
    const savedLang = localStorage.getItem('language') || 'fr';
    this.setLanguage(savedLang);
  }

  setLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLangSubject.next(lang);
    localStorage.setItem('language', lang);
  }

  getCurrentLang(): string {
    return this.currentLangSubject.value;
  }
}