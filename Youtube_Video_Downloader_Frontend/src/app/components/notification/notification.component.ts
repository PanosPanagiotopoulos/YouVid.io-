import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="show" 
      class="notification"
      [class.success]="type === 'success'"
      [class.error]="type === 'error'"
      role="alert"
    >
      <div class="notification-content">
        <div class="icon" aria-hidden="true">
          <svg *ngIf="type === 'success'" viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
          <svg *ngIf="type === 'error'" viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
          </svg>
        </div>
        <p class="message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .notification {
      position: fixed;
      top: var(--spacing-8);
      right: var(--spacing-8);
      padding: var(--spacing-4) var(--spacing-8);
      border-radius: 8px;
      color: var(--white);
      z-index: var(--z-modal);
      transform: translateZ(0);
      backface-visibility: hidden;
      -webkit-font-smoothing: subpixel-antialiased;
      animation: slideIn var(--transition-base) cubic-bezier(0.68, -0.55, 0.265, 1.55);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }

    .success {
      background: rgba(46, 213, 115, 0.95);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }

    .error {
      background: rgba(255, 71, 87, 0.95);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }

    .notification-content {
      display: flex;
      align-items: center;
      gap: var(--spacing-4);
    }

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .message {
      margin: 0;
      font-size: var(--text-base);
      line-height: 1.5;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%) translateZ(0);
      }
      to {
        opacity: 1;
        transform: translateX(0) translateZ(0);
      }
    }

    @media (max-width: 768px) {
      .notification {
        top: auto;
        bottom: var(--spacing-8);
        left: var(--spacing-4);
        right: var(--spacing-4);
      }
    }

    @supports not (backdrop-filter: blur(8px)) {
      .success, .error {
        background: rgb(46, 213, 115);
      }
      .error {
        background: rgb(255, 71, 87);
      }
    }
  `]
})
export class NotificationComponent {
  @Input() show = false;
  @Input() type: 'success' | 'error' = 'success';
  @Input() message = '';
}