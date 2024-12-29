import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-toggle">
      <button 
        *ngFor="let lang of languages" 
        (click)="setLanguage(lang.code)"
        [class.active]="currentLang === lang.code"
        class="lang-button"
      >
        {{ lang.label }}
      </button>
    </div>
  `,
  styles: [`
    .language-toggle {
      position: fixed;
      top: 2rem;
      right: 3rem;
      z-index: 1000;
      display: flex;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      padding: 0.25rem;
      border-radius: 2rem;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .lang-button {
      padding: 0.5rem 1rem;
      border-radius: 1.5rem;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .lang-button:hover {
      color: white;
    }

    .lang-button.active {
      background: var(--primary-red);
      color: white;
    }

    .lang-button.active::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
      border-radius: inherit;
    }

    @media (max-width: 768px) {
      .language-toggle {
        top: 1rem;
        right: 1rem;
        transform: scale(0.85);
        transform-origin: top right;
      }

      .lang-button {
        padding: 0.35rem 0.75rem;
        font-size: 0.75rem;
      }
    }

    @media (max-width: 480px) {
      .language-toggle {
        transform: scale(0.8);
      }
    }
  `]
})
export class LanguageToggleComponent {
  languages = [
    { code: 'en', label: 'EN' },
    { code: 'gr', label: 'GR' }
  ] as const;

  currentLang: 'en' | 'gr' = 'en';

  constructor(private languageService: LanguageService) {
    this.languageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });
  }

  setLanguage(lang: 'en' | 'gr') {
    this.languageService.setLanguage(lang);
  }
}