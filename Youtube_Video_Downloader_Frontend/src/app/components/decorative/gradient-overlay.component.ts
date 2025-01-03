import { Component } from '@angular/core';

@Component({
  selector: 'app-gradient-overlay',
  standalone: true,
  template: `
    <div class="gradient-container">
      <div class="gradient-overlay"></div>
      <div class="noise-overlay"></div>
    </div>
  `,
  styles: [`
    .gradient-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
    }

    .gradient-overlay {
      position: absolute;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at 50% 50%, 
        rgba(255, 0, 0, 0.1) 0%,
        rgba(0, 0, 0, 0.3) 100%
      );
    }

    .noise-overlay {
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0.05;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }
  `]
})
export class GradientOverlayComponent {}