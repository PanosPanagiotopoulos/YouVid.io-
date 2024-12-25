import { Component, Output, EventEmitter } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { LoadingOverlayComponent } from "../loading/loading-overlay.component";
import { DownloadEvent } from "./download.interface";

@Component({
  selector: "app-search-box",
  standalone: true,
  imports: [FormsModule, LoadingOverlayComponent],
  template: `
    <div class="download-container">
      <input
        type="text"
        [(ngModel)]="searchQuery"
        (keyup.enter)="onDownload()"
        placeholder="Enter YouTube URL..."
        class="download-input"
        [class.disabled]="isLoading"
      />
      <button
        (click)="onDownload()"
        class="download-button"
        [class.loading]="isLoading"
        [disabled]="isLoading"
      >
        <span class="button-text" [class.hidden]="isLoading">Download</span>
        <div class="loader" [class.visible]="isLoading"></div>
      </button>
    </div>
    <app-loading-overlay [isLoading]="isLoading" />
  `,
  styles: [
    `
      .download-container {
        position: relative;
        z-index: 1000;
        width: 100%;
        max-width: 800px;
        margin: 2rem auto;
        padding: 0 2rem;
      }

      .download-input {
        width: 100%;
        padding: 1.5rem 2rem;
        font-size: 1.4rem;
        border: none;
        border-radius: 50px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        color: white;
        transition: all 0.3s ease;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      }

      .download-input:focus {
        outline: none;
        background: rgba(255, 255, 255, 0.15);
        box-shadow: 0 15px 40px rgba(255, 0, 0, 0.2);
      }

      .download-input.disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .download-button {
        position: absolute;
        right: 2.7rem;
        top: 50%;
        transform: translateY(-50%);
        padding: 1rem 3rem;
        border: none;
        border-radius: 25px;
        background: #ff0000;
        color: white;
        font-size: 1.3rem;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 80px;
        height: 55px;
        box-shadow: 0 5px 20px rgba(255, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
      }

      .download-button:hover:not(:disabled) {
        background: #cc0000;
        transform: translateY(-50%) scale(1.05);
        box-shadow: 0 8px 25px rgba(255, 0, 0, 0.4);
      }

      .button-text {
        transition: opacity 0.3s ease;
      }

      .button-text.hidden {
        opacity: 0;
      }

      .loader {
        position: absolute;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }

      .loader.visible {
        opacity: 1;
        visibility: visible;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class SearchBoxComponent {
  @Output() download = new EventEmitter<DownloadEvent>();
  searchQuery = "";
  isLoading = false;

  async onDownload() {
    if (this.searchQuery.trim() && !this.isLoading) {
      this.isLoading = true;
      try {
        this.download.emit({
          query: this.searchQuery.trim(),
          timestamp: Date.now(),
        });
      } finally {
        setTimeout(() => {
          this.isLoading = false;
        }, 20000);
      }
    }
  }
}
