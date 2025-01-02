import { Injectable } from "@angular/core";
import { firstValueFrom, lastValueFrom } from "rxjs";
import { DownloadEvent } from "../components/search-box/interfaces/download.interface";
import { DownloadManagerService } from "./download-manager.service";
import { DownloadLimitService } from "./download-limit.service";
import { VideoDownloadService } from "./video-download.service";
import { IframeDownloadService } from "./download/iframe-download.service";

@Injectable({
  providedIn: "root",
})
export class YoutubeService {
  constructor(
    private downloadManager: DownloadManagerService,
    private downloadLimitService: DownloadLimitService,
    private videoDownloadService: VideoDownloadService,
    private iframeDownloadService: IframeDownloadService
  ) {
    // Listen for iframe download events
    this.iframeDownloadService.downloadEvents$.subscribe((event) => {
      const downloads = this.downloadManager.downloads.value;
      const download = downloads.find((d) => d.status === "downloading");

      if (download) {
        switch (event.type) {
          case "complete":
            this.downloadManager.updateDownload(download.id, {
              status: "completed",
              progress: 100,
            });
            setTimeout(() => {
              this.downloadManager.removeDownload(download.id);
            }, 3000);
            break;

          case "error":
            this.downloadManager.updateDownload(download.id, {
              status: "error",
              error: event.error?.message || "Download failed",
              progress: 0,
            });
            setTimeout(() => {
              this.downloadManager.removeDownload(download.id);
            }, 5000);
            break;
        }
      }
    });
  }

  async downloadVideo(requestedVideoData: DownloadEvent): Promise<void> {
    const canAdd = await firstValueFrom(
      this.downloadLimitService.canAddDownload()
    );

    if (!canAdd) {
      this.downloadLimitService.showLimitExceededPopup();
      return;
    }

    const downloadId = this.downloadManager.addDownload(
      requestedVideoData.query
    );

    this.downloadManager.updateDownload(downloadId, {
      status: "downloading",
    });

    try {
      await lastValueFrom(
        this.videoDownloadService.downloadVideo(
          requestedVideoData.query,
          requestedVideoData.quality
        )
      );
    } catch (error) {
      this.downloadManager.updateDownload(downloadId, {
        status: "error",
        error: error instanceof Error ? error.message : "Download failed",
        progress: 0,
      });
      setTimeout(() => {
        this.downloadManager.removeDownload(downloadId);
      }, 5000);
    }
  }
}
