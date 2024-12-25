import { Component } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideHttpClient } from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { BackgroundComponent } from "./app/components/background/background.component";
import { HeaderComponent } from "./app/components/header/header.component";
import { SearchBoxComponent } from "./app/components/search-box/search-box.component";
import { VideoListComponent } from "./app/components/video-list/video-list.component";
import { FooterComponent } from "./app/components/footer/footer.component";
import { YoutubeService } from "./app/services/youtube.service";
import { DownloadEvent } from "./app/components/search-box/download.interface";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    BackgroundComponent,
    HeaderComponent,
    SearchBoxComponent,
    VideoListComponent,
    FooterComponent,
  ],
  template: `
    <div class="wrapper">
      <app-background [videos]="videos" />
      <div class="content">
        <app-header />
        <app-search-box (download)="onDownload($event)" />
        <app-video-list [videos]="videos" />
      </div>
      <app-footer />
    </div>
  `,
  styles: [
    `
      .wrapper {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      :host {
        display: block;
        background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
        color: white;
      }

      .content {
        position: relative;
        z-index: 1;
        flex: 1;
      }
    `,
  ],
})
export class App {
  videos: any[] = [];

  constructor(private youtubeService: YoutubeService) {}

  onDownload(event: DownloadEvent) {
    if (event.query) {
      this.youtubeService.downloadVideo(event.query);
    }
  }
}

bootstrapApplication(App, {
  providers: [provideHttpClient(), provideAnimations()],
});
