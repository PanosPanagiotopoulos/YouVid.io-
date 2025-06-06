import { Component, Output, EventEmitter } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { QualitySelectorComponent } from "./quality-selector/quality-selector.component";
import { SkeletonLoaderComponent } from "../loading/skeleton-loader/skeleton-loader.component";
import { QueueService, VideoInQueueStatus } from "../../services/queue.service";
import { interval, Subscription } from "rxjs";

 @Component({
  selector: "app-search-box",
  standalone: true,
  imports: [FormsModule, CommonModule, QualitySelectorComponent],
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
 <app-quality-selector (qualityChange)="onQualityChange($event)" (formatChange)="onFormatChange($event)" />
        <button
          (click)="onDownload()"
          class="download-button"
          [class.loading]="isLoading"
          [disabled]="isLoading || !searchQuery.trim()"
        >
          <span class="button-content" [class.hidden]="isLoading">
            {{ translate("search.download") }}
          </span>
          <div class="loading-circle" [class.visible]="isLoading"></div>
        </button>
      </div>

      <div *ngIf="videoLoading">
        <app-skeleton-loader></app-skeleton-loader>
        <div class="download-progress">{{ downloadPercentage }}%</div>
      </div>
    </div>
  `,
  styles: [
    `
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
        position: relative;
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

      .button-content {
        opacity: 1;
        transition: opacity 0.2s;
      }

      .button-content.hidden {
        opacity: 0;
      }

      .loading-circle {
        position: absolute;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s;
        animation: spin 1s linear infinite;
      }

      .loading-circle.visible {
        opacity: 1;
        visibility: visible;
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
    `,
 `
      .download-progress {
        margin-top: var(--spacing-2);
        text-align: center;
        color: var(--white);
      }
  ],
})
export class SearchBoxComponent {
  @Output() search = new EventEmitter<DownloadEvent>();
  searchQuery = "";
  isLoading = false;
  selectedQuality = "Normal";
  videoLoading = false;
 selectedFormat = "mp4";
  downloadPercentage = 0;

  constructor() {}
 private queueStatusSubscription: Subscription | undefined;

  onQualityChange(quality: string) {
    this.selectedQuality = quality;
  }

 onFormatChange(format: string) {
 this.selectedFormat = format;
  }

  async onDownload() {
    if (this.searchQuery.trim() && !this.isLoading) {
      this.isLoading = true;
      this.videoLoading = true;
      this.downloadPercentage = 0;

      // Stop any existing polling
      if (this.queueStatusSubscription) {
        this.queueStatusSubscription.unsubscribe();
      }

      try {
        const videoId = this.extractVideoId(this.searchQuery.trim()); // Assuming a method to extract video ID from URL
        if (!videoId) {
          console.error("Invalid YouTube URL");
 this.videoLoading = false;
          this.isLoading = false;
          return;
        }

        const addedVideo = await this.queueService.addVideoToQueue(videoId, this.selectedFormat, this.selectedQuality).toPromise();
        if (addedVideo) {
          this.pollVideoStatus(videoId);
        } else {
          console.error("Failed to add video to queue");
 this.videoLoading = false;
          this.isLoading = false;
        }
      } catch (error) {
        console.error("Error adding video to queue:", error);
        this.videoLoading = false;
        this.isLoading = false;
      } finally {
 // Reset search button loading state after 2 seconds
 setTimeout(() => {
          this.isLoading = false;
          }
        , 2000);
      }
    }
  }
}
