import * as THREE from 'three';

export class VideoParticle {
  private texture: THREE.Texture;
  private material: THREE.SpriteMaterial;
  public sprite: THREE.Sprite;

  constructor(thumbnailUrl: string) {
    this.texture = new THREE.TextureLoader().load(thumbnailUrl);
    this.material = new THREE.SpriteMaterial({ 
      map: this.texture,
      transparent: true,
      opacity: 0.8
    });
    this.sprite = new THREE.Sprite(this.material);
    
    // Random position in space
    this.sprite.position.set(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10
    );
    
    // Scale the sprite to look like a video thumbnail
    this.sprite.scale.set(1, 0.6, 1);
  }

  update() {
    // Gentle floating motion
    this.sprite.position.y += Math.sin(Date.now() * 0.001) * 0.001;
    this.sprite.rotation.z += 0.001;
  }
}