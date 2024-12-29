import * as THREE from 'three';

export class YouTubeLogo {
  private group: THREE.Group;

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();

    // Create the main rectangle with beveled edges
    const rectGeometry = new THREE.BoxGeometry(9, 6, 1);
    const rectMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0xff0000,
      metalness: 0.5,
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    const rect = new THREE.Mesh(rectGeometry, rectMaterial);

    // Create the play button triangle
    const triangleShape = new THREE.Shape();
    triangleShape.moveTo(-1.5, -1.0);
    triangleShape.lineTo(-1.5, 1.0);
    triangleShape.lineTo(1.5, 0);
    triangleShape.lineTo(-1.5, -1.0);

    const triangleGeometry = new THREE.ExtrudeGeometry(triangleShape, {
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.2,
      bevelSize: 0.1,
      bevelSegments: 3
    });

    const triangleMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.4
    });

    const triangle = new THREE.Mesh(triangleGeometry, triangleMaterial);
    triangle.position.z = 0.05;

    // Add lighting
    const pointLight1 = new THREE.PointLight(0xff0000, 1, 50);
    pointLight1.position.set(5, 5, 5);
    
    const pointLight2 = new THREE.PointLight(0xffffff, 0.8, 50);
    pointLight2.position.set(-5, -5, 5);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);

    // Add everything to the group
    this.group.add(rect);
    this.group.add(triangle);
    this.group.add(pointLight1);
    this.group.add(pointLight2);
    this.group.add(ambientLight);

    // Position the logo under the search input
    this.group.position.set(0, 10, -15);
    
    scene.add(this.group);
  }

  update() {
    // Continuous 360-degree rotation on Y-axis
    this.group.rotation.y += 0.02;
    
    // Add subtle floating motion
    this.group.position.y = 2 + Math.sin(Date.now() * 0.001) * 0.3;
  }
}