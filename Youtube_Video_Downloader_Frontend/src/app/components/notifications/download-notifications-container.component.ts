import { Component, HostListener } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DownloadNotificationComponent } from "./download-notification.component";
import { DownloadManagerService } from "../../services/download-manager.service";

@Component({
  selector: "app-download-notifications-container",
  standalone: true,
  imports: [CommonModule, DownloadNotificationComponent],
  template: `
    <div
      class="notifications-container"
      [class.expanded]="isExpanded"
      [class.mobile]="isMobile"
    >
      <div class="header" (click)="toggleExpand()">
        <span class="notification-title">Queued Downloads</span>
        <span class="expand-icon">{{ isExpanded ? "▼" : "▲" }}</span>
      </div>

      <div class="notifications-wrapper" [class.expanded]="isExpanded">
        @if ((downloads$ | async)?.length) {
        <div class="notifications-list">
          @for (download of downloads$ | async; track download.id) {
          <app-download-notification
            [download]="download"
            (close)="removeNotification(download.id)"
          />
          }
        </div>
        } @else {
        <div class="empty-state">
          <div class="empty-icon">📥</div>
          <p class="empty-message">No active downloads</p>
          <p class="empty-subtitle">Your downloads will appear here</p>
        </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .notifications-container {
        position: fixed;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 400px;
        z-index: 1000;
        background: rgba(0, 0, 0, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 12px 12px 0 0;
        box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1);
      }

      .header {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0.75rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        cursor: pointer;
        gap: 0.5rem;
      }

      .notification-title {
        font-weight: 500;
        color: white;
      }

      .expand-icon {
        color: rgba(255, 255, 255, 0.7);
      }

      .notifications-wrapper {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
        padding: 0;
      }

      .notifications-wrapper.expanded {
        max-height: calc(100vh - 8rem);
        padding: 1rem;
        overflow-y: auto;
      }

      .notifications-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .empty-state {
        padding: 2rem;
        text-align: center;
        color: rgba(255, 255, 255, 0.7);
      }

      .empty-icon {
        font-size: 2rem;
        margin-bottom: 1rem;
      }

      .empty-message {
        font-weight: 500;
        margin-bottom: 0.5rem;
      }

      .empty-subtitle {
        font-size: 0.9rem;
        opacity: 0.7;
      }

      @media (max-width: 768px) {
        .notifications-container {
          width: 100%;
          border-radius: 0;
        }

        .notifications-wrapper.expanded {
          max-height: calc(100vh - 8rem);
          padding: 0.75rem;
        }

        .notifications-list {
          gap: 0.875rem;
        }
      }
    `,
  ],
})
export class DownloadNotificationsContainerComponent {
  downloads$ = this.downloadManager.downloads$;
  isExpanded = false;
  isMobile = false;

  constructor(private downloadManager: DownloadManagerService) {
    this.checkMobile();
  }

  @HostListener("window:resize")
  checkMobile() {
    this.isMobile = window.innerWidth <= 768;
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  removeNotification(id: string) {
    const download = this.downloadManager.getDownload(id);
    if (download?.status === "completed" || download?.status === "error") {
      this.downloadManager.removeDownload(id);
    }
  }
}
