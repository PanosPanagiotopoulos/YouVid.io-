import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DownloadLimitService } from "../../services/download-limit.service";
import { trigger, transition, style, animate } from "@angular/animations";

@Component({
  selector: "app-limit-popup",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="downloadLimitService.showLimitPopup$ | async"
      class="limit-popup"
      [@popupAnimation]
    >
      <div class="popup-content">
        <div class="icon">⚠️</div>
        <p>Maximum of 3 concurrent downloads allowed</p>
      </div>
    </div>
  `,
  animations: [
    trigger("popupAnimation", [
      transition(":enter", [
        style({
          opacity: 0,
          transform: "translate(-50%, 20px)",
        }),
        animate(
          "300ms cubic-bezier(0.4, 0, 0.2, 1)",
          style({
            opacity: 1,
            transform: "translate(-50%, 0)",
          })
        ),
      ]),
      transition(":leave", [
        animate(
          "300ms cubic-bezier(0.4, 0, 0.2, 1)",
          style({
            opacity: 0,
            transform: "translate(-50%, 20px)",
          })
        ),
      ]),
    ]),
  ],
  styles: [
    `
      .limit-popup {
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        padding: 1rem 1.5rem;
        color: white;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 2000;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .popup-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .icon {
        font-size: 1.25rem;
      }

      p {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 500;
      }

      @media (max-width: 768px) {
        .limit-popup {
          width: calc(100% - 2rem);
          bottom: 5rem;
        }
      }
    `,
  ],
})
export class LimitPopupComponent {
  constructor(public downloadLimitService: DownloadLimitService) {}
}
