import { Component, Output, EventEmitter } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { LoadingOverlayComponent } from "../loading/loading-overlay.component";
import { QualitySelectorComponent } from "./quality-selector/quality-selector.component";
import { DownloadEvent } from "./interfaces/download.interface";
import { LanguageService } from "../../services/language.service";

@Component({
  selector: "app-search-box",
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    LoadingOverlayComponent,
    QualitySelectorComponent
  ],
  template: `
    <div class="search-container">
      <div class="input-group">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (keyup.enter)="onDownload()"
          [placeholder]="translate('search.placeholder')"
          class="search-input"
          [class.disabled]="isLoading"
        />
        <app-quality-selector (qualityChange)="onQualityChange($event)" />
        <button
          (click)="onDownload()"
          class="download-button"
          [class.loading]="isLoading"
          [disabled]="isLoading || !searchQuery.trim()"
        >
          <span class="button-text" [class.hidden]="isLoading">
            {{ translate('search.download') }}
          </span>
          <div class="loader" [class.visible]="isLoading"></div>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      width: min(90%, 800px);
      margin: 0 auto;
      padding: 0 var(--spacing-4);
      position: relative;
      z-index: var(--z-header);
    }

    .input-group {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 50px;
      padding: var(--spacing-2);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .search-input {
      flex: 1;
      min-width: 0;
      padding: var(--spacing-3) var(--spacing-4);
      background: transparent;
      border: none;
      color: var(--white);
    }

    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }

    .download-button {
      padding: var(--spacing-3) var(--spacing-8);
      border-radius: 25px;
      background: var(--primary-red);
      color: var(--white);
      font-size: var(--text-base);
      min-width: 140px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translateZ(0);
      transition: all var(--transition-base);
    }

    .download-button:not(:disabled):hover {
      background: #cc0000;
      transform: translateZ(0) scale(1.05);
    }

    .download-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .loader {
      display: none;
    }

    .loader.visible {
      display: block;
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: var(--white);
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (max-width: 768px) {
      .search-container {
        width: min(95%, 600px);
      }

      .input-group {
        flex-direction: column;
        background: transparent;
        backdrop-filter: none;
        box-shadow: none;
        gap: var(--spacing-4);
        padding: 0;
      }

      .search-input {
        width: 100%;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 25px;
        padding: var(--spacing-4);
      }

      .download-button {
        width: 60%;
        max-width: 35%;
      }
    }
  `]
})
export class SearchBoxComponent {
  @Output() search = new EventEmitter<DownloadEvent>();
  searchQuery = "";
  isLoading = false;
  selectedQuality = "Normal";

  constructor(private languageService: LanguageService) {}

  translate(key: string): string {
    return this.languageService.getTranslation(key);
  }

  onQualityChange(quality: string) {
    this.selectedQuality = quality;
  }

  async onDownload() {
    if (this.searchQuery.trim() && !this.isLoading) {
      this.search.emit({
        query: this.searchQuery.trim(),
        timestamp: Date.now(),
        quality: this.selectedQuality,
      });
    }
  }
}