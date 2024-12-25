import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overlay" *ngIf="isLoading">
      <div class="loader-container">
        <div class="youtube-loader">
          <div class="red-bar"></div>
          <div class="white-bar"></div>
        </div>
        <p class="loading-text">{{ loadingText }}</p>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(10px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loader-container {
      text-align: center;
    }

    .youtube-loader {
      width: 200px;
      height: 60px;
      position: relative;
      overflow: hidden;
      border-radius: 30px;
      margin-bottom: 20px;
    }

    .red-bar {
      position: absolute;
      width: 100%;
      height: 100%;
      background: #ff0000;
      animation: loading 2s infinite;
    }

    .white-bar {
      position: absolute;
      width: 100%;
      height: 100%;
      background: white;
      transform: translateX(-100%);
      animation: loading 2s 0.5s infinite;
    }

    .loading-text {
      color: white;
      font-size: 1.2rem;
      margin-top: 2rem;
      opacity: 0.8;
    }

    @keyframes loading {
      0% { transform: translateX(-100%); }
      50% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }
  `]
})
export class LoadingOverlayComponent {
  @Input() isLoading = false;
  @Input() loadingText = 'Loading your request...';
}