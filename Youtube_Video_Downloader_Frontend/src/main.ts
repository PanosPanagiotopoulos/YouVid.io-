import { Component } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideHttpClient } from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { HeaderComponent } from "./app/components/header/header.component";
import { SearchBoxComponent } from "./app/components/search-box/search-box.component";
import { VideoListComponent } from "./app/components/video-list/video-list.component";
import { FooterComponent } from "./app/components/footer/footer.component";
import { FloatingShapesComponent } from "./app/components/decorative/floating-shapes.component";
import { GradientOverlayComponent } from "./app/components/decorative/gradient-overlay.component";
import { Youtube3dLogoComponent } from "./app/components/youtube-3d-logo/youtube-3d-logo.component";
import { LogoComponent } from "./app/components/logo/logo.component";
import { LanguageToggleComponent } from "./app/components/language-toggle/language-toggle.component";
import { DownloadNotificationsContainerComponent } from "./app/components/notifications/download-notifications-container.component";
import { YoutubeService } from "./app/services/youtube.service";
import { TimingService } from "./app/services/timing.service";
import { LanguageService } from "./app/services/language.service";
import { DownloadEvent } from "./app/components/search-box/interfaces/download.interface";
import { LimitPopupComponent } from "./app/components/notifications/limit-popup.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    HeaderComponent,
    SearchBoxComponent,
    VideoListComponent,
    FooterComponent,
    FloatingShapesComponent,
    GradientOverlayComponent,
    Youtube3dLogoComponent,
    LogoComponent,
    LanguageToggleComponent,
    DownloadNotificationsContainerComponent,
    LimitPopupComponent,
  ],
  template: `
    <div class="wrapper">
      <app-floating-shapes />
      <app-gradient-overlay />
      <app-logo />
      <app-language-toggle />
      <app-youtube-3d-logo />
      <div class="content">
        <app-header />
        <app-search-box (search)="onSearch($event)" />
        <app-video-list [videos]="videos" />
      </div>
      <app-footer />
      <app-download-notifications-container />
      <app-limit-popup />
    </div>
  `,
  styles: [
    `
      .wrapper {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        overflow-y: auto;
        position: relative;
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

  constructor(
    private youtubeService: YoutubeService,
    private timingService: TimingService,
    private languageService: LanguageService
  ) {}

  translate(key: string): string {
    return this.languageService.getTranslation(key);
  }

  async onSearch(event: DownloadEvent) {
    try {
      await this.youtubeService.downloadVideo(event);
    } catch (error) {
      console.error("Download failed:", error);
    }
  }
}

bootstrapApplication(App, {
  providers: [provideHttpClient(), provideAnimations(), LanguageService],
});

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/video-cache-sw.js').then(registration => {
      console.log('Service Worker registered: ', registration);
    }).catch(error => {
      console.log('Service Worker registration failed: ', error);
    });
  });
}
