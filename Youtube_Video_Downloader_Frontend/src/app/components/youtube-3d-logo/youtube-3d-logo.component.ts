import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import * as THREE from "three";

@Component({
  selector: "app-youtube-3d-logo",
  standalone: true,
  template: `<canvas #canvas></canvas>`,
  styles: [
    `
      canvas {
        width: 100%;
        height: 100vh;
        position: absolute;
        left: 49%;
        top: 76%;
        transform: translate(-50%, -50%);
        z-index: var(--z-background);
        pointer-events: none;
      }

      @media (max-width: 768px) {
        canvas {
          transform: translate(-50%, -50%) scale(0.7);
          top: 67%;
        }
      }
    `,
  ],
})
export class Youtube3dLogoComponent implements OnInit, OnDestroy {
  @ViewChild("canvas", { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private logo!: THREE.Group;
  private animationFrameId?: number;

  ngOnInit() {
    this.initScene();
    this.createLogo();
    this.animate();
    window.addEventListener("resize", this.onWindowResize.bind(this));
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener("resize", this.onWindowResize.bind(this));
    this.dispose();
  }

  private initScene() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 20;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  private createLogo() {
    this.logo = new THREE.Group();

    // Create main rectangle
    const mainGeometry = new THREE.BoxGeometry(16, 10, 1);
    const mainMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xff0000,
      metalness: 0.7,
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const mainMesh = new THREE.Mesh(mainGeometry, mainMaterial);

    // Create play button
    const playShape = new THREE.Shape();
    playShape.moveTo(-2, -2);
    playShape.lineTo(-2, 2);
    playShape.lineTo(2, 0);
    playShape.lineTo(-2, -2);

    const playGeometry = new THREE.ExtrudeGeometry(playShape, {
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.2,
      bevelSize: 0.1,
      bevelSegments: 3,
    });

    const playMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.5,
      roughness: 0.3,
    });

    const playMesh = new THREE.Mesh(playGeometry, playMaterial);
    playMesh.position.z = 0.5;

    // Add lighting
    const frontLight = new THREE.DirectionalLight(0xffffff, 1);
    frontLight.position.set(0, 0, 10);

    const backLight = new THREE.DirectionalLight(0xff0000, 0.8);
    backLight.position.set(-5, 5, -5);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);

    this.logo.add(mainMesh, playMesh, frontLight, backLight, ambientLight);
    this.logo.position.y = 0;
    this.scene.add(this.logo);
  }

  private animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    if (this.logo) {
      this.logo.rotation.y += 0.01;
      this.logo.position.y = Math.sin(Date.now() * 0.001) * 0.5;
    }

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize() {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  private dispose() {
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (object.material instanceof THREE.Material) {
          object.material.dispose();
        } else if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        }
      }
    });

    this.renderer.dispose();
  }
}
