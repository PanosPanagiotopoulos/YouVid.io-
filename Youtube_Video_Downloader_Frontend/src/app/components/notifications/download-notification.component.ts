import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Download } from "../../models/download.model";
import { trigger, transition, style, animate } from "@angular/animations";

@Component({
  selector: "app-download-notification",
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger("notificationAnimation", [
      transition(":enter", [
        style({
          transform: "translateX(100%)",
          opacity: 0,
        }),
        animate(
          "300ms cubic-bezier(0.4, 0, 0.2, 1)",
          style({
            transform: "translateX(0)",
            opacity: 1,
          })
        ),
      ]),
      transition(":leave", [
        animate(
          "300ms cubic-bezier(0.4, 0, 0.2, 1)",
          style({
            transform: "translateX(100%)",
            opacity: 0,
          })
        ),
      ]),
    ]),
  ],
  template: `
    <div
      class="notification"
      [class]="download.status"
      [@notificationAnimation]
    >
      <div class="notification-content">
        <div class="header">
          <span class="title">{{ getTitle() }}</span>
          <button
            *ngIf="canClose()"
            class="close"
            (click)="close.emit()"
            aria-label="Close notification"
          >
            &times;
          </button>
        </div>
        <p class="url">{{ download.url }}</p>
        <div
          class="progress-container"
          *ngIf="download.status === 'downloading'"
        >
          <div class="progress-bar" [style.width.%]="simulatedProgress">
            <div class="progress-glow"></div>
          </div>
          <span class="progress-text">{{ simulatedProgress }}%</span>
        </div>
        <p class="message" *ngIf="download.error">{{ download.error }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .notification {
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 12px;
        padding: 1rem;
        width: 100%;
        color: white;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        border-left: 4px solid #666;
        position: relative;
        overflow: hidden;
      }

      .notification::before {
        content: "";
        position: absolute;
        top: 0;
        left: -4px;
        width: 4px;
        height: 100%;
        background: inherit;
        filter: brightness(150%);
      }

      .notification.downloading {
        border-left-color: #2a5783;
      }

      .notification.completed {
        border-left-color: #4caf50;
        background: rgba(76, 175, 80, 0.2);
      }

      .notification.error {
        border-left-color: #f44336;
        background: rgba(244, 67, 54, 0.2);
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .title {
        font-weight: 600;
        font-size: 0.95rem;
      }

      .url {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.7);
        margin: 0.25rem 0;
        word-break: break-all;
      }

      .close {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.6);
        font-size: 1.5rem;
        line-height: 1;
        padding: 0.25rem;
        cursor: pointer;
        transition: color 0.2s;
      }

      .close:hover {
        color: white;
      }

      .progress-container {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        height: 6px;
        margin: 0.75rem 0;
        position: relative;
        overflow: hidden;
      }

      .progress-bar {
        background: #ff0000;
        height: 100%;
        transition: width 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .progress-glow {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.3),
          transparent
        );
        animation: glow 1.5s linear infinite;
      }

      .progress-text {
        position: absolute;
        right: 0;
        top: -1.25rem;
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.8);
      }

      .message {
        margin: 0.5rem 0 0;
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.9);
      }

      @keyframes glow {
        from {
          transform: translateX(-100%);
        }
        to {
          transform: translateX(100%);
        }
      }

      @media (max-width: 768px) {
        .notification {
          margin: 0;
          border-radius: 8px;
          padding: 0.875rem;
        }

        .title {
          font-size: 0.85rem;
        }

        .url {
          font-size: 0.75rem;
        }

        .message {
          font-size: 0.75rem;
        }

        .close {
          padding: 0.2rem;
        }
      }
    `,
  ],
})
export class DownloadNotificationComponent implements OnInit, OnDestroy {
  @Input() download!: Download;
  @Output() close = new EventEmitter<void>();

  simulatedProgress = 0;
  private progressInterval: number | undefined;

  ngOnInit() {
    if (this.download.status === "downloading") {
      this.startSimulatedProgress();
    }
  }

  ngOnDestroy() {
    this.stopSimulatedProgress();
  }

  private startSimulatedProgress() {
    this.progressInterval = window.setInterval(() => {
      if (this.download.status !== "downloading") {
        this.stopSimulatedProgress();
        return;
      }

      // Slow down progress as it gets higher
      const increment = Math.max(0.2, (100 - this.simulatedProgress) * 0.01);
      this.simulatedProgress = Math.min(95, this.simulatedProgress + increment);
    }, 100);
  }

  private stopSimulatedProgress() {
    if (this.progressInterval) {
      window.clearInterval(this.progressInterval);
      this.progressInterval = undefined;
    }

    if (this.download.status === "completed") {
      this.simulatedProgress = 100;
    }
  }

  getTitle(): string {
    switch (this.download.status) {
      case "downloading":
        return "Downloading Youtube Video...";
      case "completed":
        return "Download Complete. Video will start downloading soon!";
      case "error":
        return "Download Failed";
      default:
        return "Preparing Download...";
    }
  }

  canClose(): boolean {
    return (
      this.download.status === "completed" || this.download.status === "error"
    );
  }
}
