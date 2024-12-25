import { Component, OnInit } from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <div class="header-container">
      <h1 class="title">
        <span class="text-3d youtube-text">YouTube</span>
        <span class="text-3d accent search-text">Search</span>
      </h1>
    </div>
  `,
  styles: [`
    .header-container {
      perspective: 1000px;
      padding: 6rem 0 4rem;
      text-align: center;
    }

    .title {
      font-size: 5rem;
      font-weight: 900;
      display: flex;
      gap: 1rem;
      justify-content: center;
      transform-style: preserve-3d;
    }

    .text-3d {
      position: relative;
      transform: translateZ(100px);
      color: white;
      clip-path: inset(0 100% 0 0);
      text-shadow: 
        0 1px 0 #ccc,
        0 2px 0 #c9c9c9,
        0 3px 0 #bbb,
        0 4px 0 #b9b9b9,
        0 5px 0 #aaa,
        0 6px 1px rgba(0,0,0,.1),
        0 0 5px rgba(0,0,0,.1),
        0 1px 3px rgba(0,0,0,.3),
        0 3px 5px rgba(0,0,0,.2),
        0 5px 10px rgba(0,0,0,.25),
        0 10px 10px rgba(0,0,0,.2),
        0 20px 20px rgba(0,0,0,.15);
    }

    .accent {
      background: linear-gradient(45deg, #ff0000, #ff6b6b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `]
})
export class HeaderComponent implements OnInit {
  ngOnInit() {
    this.animateText();
  }

  private animateText() {
    gsap.to('.youtube-text', {
      clipPath: 'inset(0 0% 0 0)',
      duration: 1,
      ease: 'power2.inOut'
    });

    gsap.to('.search-text', {
      clipPath: 'inset(0 0% 0 0)',
      duration: 1,
      delay: 0.5,
      ease: 'power2.inOut'
    });
  }
}