import { Component, OnInit, OnDestroy, ElementRef, Renderer2 } from "@angular/core";
import { LanguageService } from "../../services/language.service";

@Component({
  selector: "app-logo",
  standalone: true,
  template: `
    <div class="logo-container">
      <div class="logo-wrapper">
        <h1 class="logo-text">
          <span class="you">You</span>
          <span class="vid">Vid</span>
          <span class="dot">.</span>
          <span class="io">io</span>
        </h1>
      </div>
    </div>
  `,
  styles: [`
    .logo-container {
      position: fixed;
      top: 3rem;
      left: 4rem;
      z-index: 1000;
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
      transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      will-change: transform, opacity, visibility;
    }

    .logo-container.hidden {
      opacity: 0;
      visibility: hidden;
      transform: translateY(-30px);
      pointer-events: none;
    }

    @media (max-width: 768px) {
      .logo-container {
        left: 50%;
        transform: translateX(-50%);
      }

      .logo-container.hidden {
        opacity: 0;
        visibility: hidden;
        transform: translate(-50%, -30px);
      }
    }

    .logo-wrapper {
      position: relative;
      padding: 0.5rem;
      filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5))
        drop-shadow(0 8px 12px rgba(255, 0, 0, 0.2));
    }

    .logo-text {
      font-size: 2rem;
      font-weight: 900;
      letter-spacing: -0.5px;
      margin: 0;
      display: flex;
      align-items: center;
    }

    .you {
      background: linear-gradient(45deg, #ffffff, #e6e6e6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 900;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }

    .vid {
      background: linear-gradient(45deg, #ff0000, #ff4444);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 900;
      text-shadow: 2px 2px 4px rgba(255, 0, 0, 0.3);
    }

    .dot {
      color: #ff0000;
      margin: 0 -2px;
      font-weight: 900;
      text-shadow: 2px 2px 4px rgba(255, 0, 0, 0.3);
    }

    .io {
      background: linear-gradient(45deg, #ffffff, #e6e6e6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 900;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }
  `]
})
export class LogoComponent implements OnInit, OnDestroy {
  private lastScrollY = 0;
  private scrollThreshold = 100;
  private ticking = false;
  private hideTimeout: number | null = null;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.onScroll.bind(this));
    if (this.hideTimeout) {
      window.clearTimeout(this.hideTimeout);
    }
  }

  private onScroll() {
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.handleScroll();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  private handleScroll() {
    const currentScrollY = window.scrollY;
    const logoContainer = this.elementRef.nativeElement.querySelector('.logo-container');

    if (currentScrollY > this.lastScrollY && currentScrollY > this.scrollThreshold) {
      // Scrolling down - hide logo
      if (this.hideTimeout) {
        window.clearTimeout(this.hideTimeout);
      }
      this.renderer.addClass(logoContainer, 'hidden');
    } else if (currentScrollY < this.lastScrollY || currentScrollY < this.scrollThreshold) {
      // Scrolling up or near top - show logo
      if (this.hideTimeout) {
        window.clearTimeout(this.hideTimeout);
      }
      this.hideTimeout = window.setTimeout(() => {
        this.renderer.removeClass(logoContainer, 'hidden');
      }, 50);
    }

    this.lastScrollY = currentScrollY;
  }

  translate(key: string): string {
    return this.languageService.getTranslation(key);
  }
}