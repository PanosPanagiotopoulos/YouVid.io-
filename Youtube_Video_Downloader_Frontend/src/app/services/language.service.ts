import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { translations } from '../i18n/translations';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLang = new BehaviorSubject<'en' | 'gr'>('en');
  currentLang$ = this.currentLang.asObservable();

  setLanguage(lang: 'en' | 'gr') {
    this.currentLang.next(lang);
  }

  getTranslation(key: string): string {
    const keys = key.split('.');
    let value: any = translations[this.currentLang.value];
    
    for (const k of keys) {
      if (value?.[k] === undefined) return key;
      value = value[k];
    }
    
    return value as string;
  }
}