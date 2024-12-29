import { Component } from "@angular/core";
import { LanguageService } from "../../services/language.service";

@Component({
  selector: "app-footer",
  standalone: true,
  template: `
    <footer class="footer">
      <div class="footer-content">
        <p class="copyright">© {{ currentYear }} {{ translate('appName') }}</p>
        <div class="footer-links">
          <a href="#" class="footer-link">{{ translate('footer.terms') }}</a>
          <a href="#" class="footer-link">{{ translate('footer.privacy') }}</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 2rem 2rem;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(3px);
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .copyright {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
    }

    .footer-links {
      display: flex;
      gap: 2rem;
    }

    .footer-link {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      transition: color 0.3s ease;
      font-size: 0.9rem;
    }

    .footer-link:hover {
      color: #ff0000;
    }

    @media (max-width: 768px) {
      .footer-content {
        flex-direction: column;
        gap: 1rem;
      }

      .footer-links {
        gap: 1rem;
      }
    }
  `]
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();

  constructor(private languageService: LanguageService) {}

  translate(key: string): string {
    return this.languageService.getTranslation(key);
  }
}