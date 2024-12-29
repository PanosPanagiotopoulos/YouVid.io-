import { Component } from '@angular/core';

@Component({
  selector: 'app-floating-shapes',
  standalone: true,
  template: `
    <div class="shapes-container">
      <div class="shape circle"></div>
      <div class="shape square"></div>
      <div class="shape triangle"></div>
      <div class="shape rectangle"></div>
      <div class="shape circle-small"></div>
      <div class="shape square-small"></div>
    </div>
  `,
  styles: [`
    .shapes-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }

    .shape {
      position: absolute;
      opacity: 0.1;
      filter: blur(8px);
      animation: float 20s infinite ease-in-out;
    }

    .circle {
      width: 300px;
      height: 300px;
      background: linear-gradient(45deg, #ff0000, #ff6b6b);
      border-radius: 50%;
      top: 10%;
      left: 15%;
      animation-delay: 0s;
    }

    .square {
      width: 200px;
      height: 200px;
      background: linear-gradient(45deg, #ff4444, #ff0000);
      top: 60%;
      right: 10%;
      animation-delay: -5s;
      transform: rotate(45deg);
    }

    .triangle {
      width: 0;
      height: 0;
      border-left: 150px solid transparent;
      border-right: 150px solid transparent;
      border-bottom: 260px solid rgba(255, 0, 0, 0.2);
      top: 40%;
      left: 60%;
      animation-delay: -10s;
    }

    .rectangle {
      width: 400px;
      height: 100px;
      background: linear-gradient(45deg, #ff0000, #ff4444);
      top: 80%;
      left: 30%;
      animation-delay: -15s;
      transform: rotate(-15deg);
    }

    .circle-small {
      width: 150px;
      height: 150px;
      background: linear-gradient(45deg, #ff6b6b, #ff0000);
      border-radius: 50%;
      top: 20%;
      right: 20%;
      animation-delay: -7s;
    }

    .square-small {
      width: 100px;
      height: 100px;
      background: linear-gradient(45deg, #ff0000, #ff4444);
      top: 70%;
      left: 5%;
      animation-delay: -12s;
      transform: rotate(30deg);
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0) rotate(0deg);
      }
      50% {
        transform: translateY(-20px) rotate(5deg);
      }
    }
  `]
})
export class FloatingShapesComponent {}