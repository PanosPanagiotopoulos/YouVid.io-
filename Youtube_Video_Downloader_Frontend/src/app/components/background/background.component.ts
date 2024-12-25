import { Component, ElementRef, OnInit, ViewChild, OnDestroy, Input } from '@angular/core';
import { SceneManager } from './scene-manager';
import { ParticleSystem } from './particle-system';
import { YouTubeLogo } from './youtube-logo';

@Component({
  selector: 'app-background',
  standalone: true,
  template: `<canvas #canvas></canvas>`,
  styles: [`
    canvas {
      position: fixed;
      top: 165px;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    }
  `]
})
export class BackgroundComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() set videos(videos: any[]) {
    if (videos?.length && this.particleSystem) {
      this.particleSystem.updateWithVideos(videos);
    }
  }
  
  private sceneManager!: SceneManager;
  private particleSystem!: ParticleSystem;
  private youtubeLogo!: YouTubeLogo;
  private animationFrameId?: number;

  ngOnInit() {
    this.initScene();
    this.animate();
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private initScene() {
    this.sceneManager = new SceneManager(this.canvasRef.nativeElement);
    this.particleSystem = new ParticleSystem(this.sceneManager.scene);
    this.youtubeLogo = new YouTubeLogo(this.sceneManager.scene);
  }

  private animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    this.particleSystem.update();
    this.youtubeLogo.update();
    this.sceneManager.render();
  }
}