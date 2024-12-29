import { Component, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LanguageService } from "../../../services/language.service";
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";

@Component({
  selector: "app-quality-selector",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quality-selector">
      <button class="selector-button" (click)="toggleDropdown()">
        {{ translate(selectedQualityKey) }}
        <span class="arrow" [@rotateArrow]="isOpen ? 'open' : 'closed'">▼</span>
      </button>
      <div
        class="dropdown-menu"
        [@dropdownAnimation]="isOpen ? 'open' : 'closed'"
        (@dropdownAnimation.done)="animationDone($event)"
      >
        <div
          class="option"
          *ngFor="let option of options"
          (click)="selectQuality(option.value, option.key)"
        >
          {{ translate(option.key) }}
        </div>
      </div>
    </div>
  `,
  animations: [
    trigger("dropdownAnimation", [
      state(
        "closed",
        style({
          opacity: 0,
          transform: "translateY(-10px)",
          visibility: "hidden",
        })
      ),
      state(
        "open",
        style({
          opacity: 1,
          transform: "translateY(0)",
          visibility: "visible",
        })
      ),
      transition("closed => open", [
        style({ visibility: "visible" }),
        animate("200ms ease-out"),
      ]),
      transition("open => closed", [animate("200ms ease-in")]),
    ]),
    trigger("rotateArrow", [
      state("closed", style({ transform: "rotate(0)" })),
      state("open", style({ transform: "rotate(180deg)" })),
      transition("closed <=> open", animate("200ms ease-in-out")),
    ]),
  ],
  styles: [`
    .quality-selector {
      position: relative;
      margin: 0 var(--spacing-2);
    }

    .selector-button {
      padding: var(--spacing-3) var(--spacing-4);
      border-radius: 25px;
      background: rgba(255, 255, 255, 0.15);
      color: var(--white);
      font-size: var(--text-base);
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      height: 44px;
      white-space: nowrap;
      transition: background var(--transition-base);
    }

    .selector-button:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .arrow {
      font-size: var(--text-sm);
      display: inline-block;
      transition: transform var(--transition-base);
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: var(--spacing-2);
      background: rgba(0, 0, 0, 0.8);
      border-radius: 12px;
      overflow: hidden;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      min-width: 150px;
      z-index: var(--z-modal);
    }

    .option {
      padding: var(--spacing-3) var(--spacing-4);
      color: var(--white);
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      transition: background var(--transition-base);
      cursor: pointer;
    }

    .option:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    @media (max-width: 768px) {
      .quality-selector {
        width: 100%;
        margin: 0;
      }

      .selector-button {
        width: 100%;
        justify-content: center;
        background: rgba(255, 255, 255, 0.1);
      }
    }
  `]
})
export class QualitySelectorComponent {
  @Output() qualityChange = new EventEmitter<string>();
  
  options = [
    { key: 'search.quality.normal', value: 'Normal' },
    { key: 'search.quality.enhanced', value: 'Enhanced' }
  ];

  isOpen = false;
  selectedQualityKey = 'search.quality.normal';

  constructor(private languageService: LanguageService) {
    // Subscribe to language changes to trigger re-render
    this.languageService.currentLang$.subscribe();
  }

  translate(key: string): string {
    return this.languageService.getTranslation(key);
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectQuality(value: string, key: string) {
    this.selectedQualityKey = key;
    this.qualityChange.emit(value);
    this.isOpen = false;
  }

  animationDone(event: any) {
    if (event.toState === "closed") {
      // Additional cleanup if needed
    }
  }
}