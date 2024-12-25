import * as THREE from 'three';

export class YouTubeLogo {
  private mesh: THREE.Group;
  
  constructor(scene: THREE.Scene) {
    // Create YouTube logo group
    this.mesh = new THREE.Group();
    
    // Create the main red rectangle
    const bodyGeometry = new THREE.BoxGeometry(9, 6, 0.5);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0xFF0000,
      specular: 0x555555,
      shininess: 30
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    
    // Create the white play button
    const triangleShape = new THREE.Shape();
    triangleShape.moveTo(0, 0);
    triangleShape.lineTo(2, 1.5);
    triangleShape.lineTo(0, 3);
    triangleShape.lineTo(0, 0);
    
    const triangleGeometry = new THREE.ShapeGeometry(triangleShape);
    const triangleMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const playButton = new THREE.Mesh(triangleGeometry, triangleMaterial);
    
    playButton.position.set(-0.5, 0, 0.3);
    
    // Add meshes to group
    this.mesh.add(body);
    this.mesh.add(playButton);
    
    // Position the logo
    this.mesh.position.set(0, -8, -2);
    this.mesh.scale.set(1.5, 1.5, 1.5);
    
    // Add lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    
    scene.add(this.mesh);
  }

  update() {
    // Gentle floating motion
    this.mesh.position.y += Math.sin(Date.now() * 0.001) * 0.005;
    this.mesh.rotation.y += 0.002;
  }
}