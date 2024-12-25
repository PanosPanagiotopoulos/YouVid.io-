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
        />
        <h3>{{ video.snippet.title }}</h3>
        <p>{{ video.snippet.channelTitle }}</p>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .video-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 2rem;
        padding: 2rem;
      }

      .video-card {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        overflow: hidden;
        transition: transform 0.3s ease;
        cursor: pointer;
      }

      .video-card:hover {
        transform: translateY(-5px);
      }

      .video-card img {
        width: 100%;
        aspect-ratio: 16/9;
        object-fit: cover;
      }

      .video-card h3 {
        padding: 1rem;
        margin: 0;
        color: white;
        font-size: 1.1rem;
      }

      .video-card p {
        padding: 0 1rem 1rem;
        margin: 0;
        color: rgba(255, 255, 255, 0.7);
      }
    `,
  ],
})
export class VideoListComponent {
  @Input() videos: any[] = [];

  openVideo(videoId: string) {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
  }
}
