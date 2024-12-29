import { Component, OnInit } from "@angular/core";
import { gsap } from "gsap";
import { LanguageService } from "../../services/language.service";

@Component({
  selector: "app-header",
  standalone: true,
  template: `
    <div class="header-container">
      <h1 class="title">
        <span class="text-3d youtube-text">{{ translate('title.video') }}</span>
        <span class="text-3d accent search-text">{{ translate('title.downloader') }}</span>
      </h1>
    </div>
  `,
  styles: [`
    .header-container {
      perspective: 1000px;
      padding: var(--spacing-12) var(--spacing-4) var(--spacing-8);
      text-align: center;
      position: relative;
      z-index: var(--z-header);
      margin-top: 6rem;
      margin-bottom: 1.25rem;
    }

    .title {
      font-size: var(--text-4xl);
      font-weight: 800;
      display: flex;
      gap: var(--spacing-4);
      justify-content: center;
      align-items: center;
      transform-style: preserve-3d;
      flex-wrap: wrap;
    }

    .text-3d {
      position: relative;
      transform: translateZ(50px);
      color: var(--white);
      clip-path: inset(0 100% 0 0);
      text-shadow: 0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb,
        0 4px 0 #b9b9b9, 0 5px 0 #aaa, 0 6px 1px rgba(0, 0, 0, 0.1),
        0 0 5px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.3),
        0 3px 5px rgba(0, 0, 0, 0.2), 0 5px 10px rgba(0, 0, 0, 0.25),
        0 10px 10px rgba(0, 0, 0, 0.2), 0 20px 20px rgba(0, 0, 0, 0.15);
      line-height: 1.2;
      padding: 0.25rem;
      max-width: 100%;
      word-break: break-word;
      hyphens: auto;
    }

    .accent {
      background: linear-gradient(45deg, var(--primary-red), #ff6b6b);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    @media (max-width: 768px) {
      .header-container {
        padding: var(--spacing-8) var(--spacing-4) var(--spacing-6);
        margin-top: 8rem;
      }

      .title {
        font-size: var(--text-3xl);
        gap: var(--spacing-2);
      }
    }

    @media (max-width: 480px) {
      .header-container {
        margin-top: 8rem;
        padding: var(--spacing-6) var(--spacing-4) var(--spacing-4);
      }

      .title {
        font-size: calc(var(--text-2xl) * 0.85);
        flex-direction: column;
        gap: var(--spacing-1);
      }

      .text-3d {
        width: 100%;
        font-size: min(calc(var(--text-2xl) * 0.85), 5vw);
      }
    }

    @media (max-width: 360px) {
      .title {
        font-size: calc(var(--text-2xl) * 0.75);
      }

      .text-3d {
        font-size: min(calc(var(--text-2xl) * 0.75), 4.5vw);
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    this.languageService.currentLang$.subscribe(() => {
      this.animateText();
    });
  }

  translate(key: string): string {
    return this.languageService.getTranslation(key);
  }

  private animateText() {
    gsap.to(".youtube-text", {
      clipPath: "inset(0 0% 0 0)",
      duration: 1,
      ease: "power2.inOut",
    });

    gsap.to(".search-text", {
      clipPath: "inset(0 0% 0 0)",
      duration: 1,
      delay: 0.5,
      ease: "power2.inOut",
    });
  }
}