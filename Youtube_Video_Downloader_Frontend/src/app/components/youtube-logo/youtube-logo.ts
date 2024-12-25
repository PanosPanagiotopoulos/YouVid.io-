import * as THREE from "three";

export class YouTubeLogo {
  private mesh: THREE.Mesh;

  constructor(scene: THREE.Scene) {
    // Create a simplified YouTube logo shape
    const geometry = new THREE.BoxGeometry(3, 2, 0.3);
    const material = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      specular: 0x555555,
      shininess: 30,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, -3, -2); // Positioned lower in the scene
    this.mesh.scale.set(1.5, 1.5, 1.5); // Made bigger

    // Add lighting for better 3D effect
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    scene.add(this.mesh);
  }

  update() {
    // Static positioning, no animations
    this.mesh.rotation.y = -0.3; // Slight angle for 3D effect
    this.mesh.rotation.x = 0.1;
  }
}
