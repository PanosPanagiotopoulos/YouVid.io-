import { Injectable } from "@angular/core";
import { Observable, from } from "rxjs";
import { ApiService } from "./api.service";
import { LoggingService } from "./logging.service";
import { QualityTranslatorService } from "./quality-translator.service";
import { HttpErrorService } from "./http-error.service";
import { IframeDownloadService } from "./download/iframe-download.service";

@Injectable({
  providedIn: "root",
})
export class VideoDownloadService {
  private readonly qualityMap: Record<string, number> = {
    normal: 1,
    enhanced: 2,
  };

  constructor(
    private apiService: ApiService,
    private logger: LoggingService,
    private qualityTranslator: QualityTranslatorService,
    private errorService: HttpErrorService,
    private iframeDownloadService: IframeDownloadService
  ) {}

  downloadVideo(url: string, quality: string): Observable<void> {
    return from(this.initiateDownload(url, quality));
  }

  private async initiateDownload(url: string, quality: string): Promise<void> {
    try {
      const cleanUrl = this.cleanYoutubeUrl(url);
      const normalizedQuality =
        this.qualityTranslator.normalizeQuality(quality);
      const qualityValue =
        this.qualityMap[normalizedQuality.toLowerCase()] || 1;

      const params = new URLSearchParams({
        url: cleanUrl,
        settings: qualityValue.toString(),
      }).toString();

      const downloadUrl = `${this.apiService.backendUrl}/video/download?${params}`;
      return this.iframeDownloadService.triggerDownload(downloadUrl);
    } catch (error) {
      this.logger.error("Download failed", error);
      throw error;
    }
  }

  private cleanYoutubeUrl(url: string): string {
    const videoId = this.extractVideoId(url);
    if (!videoId) {
      throw new Error("Invalid YouTube URL");
    }
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  private extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
      /^[a-zA-Z0-9_-]{11}$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }
    return null;
  }
}
