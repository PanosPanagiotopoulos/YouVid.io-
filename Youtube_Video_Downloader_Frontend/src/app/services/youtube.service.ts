import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { QualityTranslatorService } from "./quality-translator.service";
import { DownloadEvent } from "../components/search-box/interfaces/download.interface";
import { lastValueFrom } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class YoutubeService {
  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private qualityTranslatorService: QualityTranslatorService
  ) {}

  private qualityMap: Record<string, number> = {
    normal: 1,
    enhanced: 2,
  };

  private extractFilename(contentDisposition: string | null): string {
    if (!contentDisposition) {
      console.log("No content disposition found");
      return "video.mp4"; // Default filename when not found
    }

    console.log(
      "Content Disposition is:\n" + JSON.stringify(contentDisposition, null, 2)
    );

    let matches = /filename\*=UTF-8''([^;]+)/.exec(contentDisposition!);
    if (matches && matches[1]) {
      return decodeURIComponent(matches[1].replace(/['"]/g, ""));
    }

    matches = /filename="?([^";\n]+)"?/.exec(contentDisposition!);
    if (matches && matches[1]) {
      return matches[1].replace(/['"]/g, "");
    }

    return "video.mp4";
  }

  /**
   * Downloads the video based on the requested video data.
   * Ensures the downloaded file is in .mp4 format with the correct title.
   * @param requestedVideoData - The data containing video URL and quality
   */
  async downloadVideo(requestedVideoData: DownloadEvent): Promise<void> {
    try {
      const normalizedQuality: string =
        this.qualityTranslatorService.normalizeQuality(
          requestedVideoData.quality
        );

      console.log("Normalized quality = " + normalizedQuality);

      const qualityParam: number = this.qualityMap[normalizedQuality] || 0;

      const params = new HttpParams()
        .set("url", requestedVideoData.query)
        .set("settings", qualityParam);

      // Await the response from the API call
      const response = await lastValueFrom(
        this.http.get(`${this.apiService.backedUrl}/video/download`, {
          params,
          responseType: "arraybuffer",
          observe: "response", // Important to observe the full response including headers
        })
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Extract the video title from the Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = this.extractFilename(contentDisposition);
      console.log("Headers:\n" + JSON.stringify(response.headers, null, 2));
      if (!filename.toLowerCase().endsWith(".mp4")) {
        filename += ".mp4";
      }

      // Create a Blob from the video data
      const videoBlob = new Blob([response.body!], { type: "video/mp4" });
      const videoUrl = window.URL.createObjectURL(videoBlob);

      // Trigger the download
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = filename; // Use the extracted video title as the filename
      a.click();

      // Clean up the URL object after downloading
      window.URL.revokeObjectURL(videoUrl);
    } catch (error: any) {
      console.error("Error downloading video:", error);
      throw new Error("Failed to download video. Please try again later.");
    }
  }
}
