import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-video-list",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="video-grid">
      @for (video of videos; track video.id.videoId) {
      <div class="video-card" (click)="openVideo(video.id.videoId)">
        <img
          [src]="video.snippet.thumbnails.medium.url"
          [alt]="video.snippet.title"
          loading="lazy"
        />
        <h3>{{ video.snippet.title }}</h3>
        <p>{{ video.snippet.channelTitle }}</p>
      </div>
      }
    </div>
  `,
  styles: [`
    .video-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--spacing-8);
      padding: var(--spacing-8);
      width: min(100%, 1400px);
      margin: 0 auto;
    }

    .video-card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 15px;
      overflow: hidden;
      transform: translateZ(0);
      backface-visibility: hidden;
      -webkit-font-smoothing: subpixel-antialiased;
      transition: transform var(--transition-base),
                  box-shadow var(--transition-base);
      cursor: pointer;
      will-change: transform;
    }

    .video-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }

    .video-card img {
      width: 100%;
      aspect-ratio: 16/9;
      object-fit: cover;
      display: block;
      background: rgba(0, 0, 0, 0.2);
    }

    .video-card h3 {
      padding: var(--spacing-4);
      margin: 0;
      color: var(--white);
      font-size: var(--text-lg);
      font-weight: 500;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .video-card p {
      padding: 0 var(--spacing-4) var(--spacing-4);
      margin: 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: var(--text-base);
    }

    @media (max-width: 768px) {
      .video-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: var(--spacing-4);
        padding: var(--spacing-4);
      }

      .video-card h3 {
        font-size: var(--text-base);
      }

      .video-card p {
        font-size: var(--text-sm);
      }
    }

    @supports not (aspect-ratio: 16/9) {
      .video-card img {
        height: 0;
        padding-bottom: 56.25%;
      }
    }
  `]
})
export class VideoListComponent {
  @Input() videos: any[] = [];

  openVideo(videoId: string) {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank", "noopener,noreferrer");
  }
}