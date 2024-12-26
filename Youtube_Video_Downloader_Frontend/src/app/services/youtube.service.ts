import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import axios from "axios";
import { ApiService } from "./api.service";

@Injectable({
  providedIn: "root",
})
export class YoutubeService {
  constructor(private apiService: ApiService) {}

  // This method uses axios and directly handles the file download
  async downloadVideo(url: string): Promise<void> {
    try {
      // Call the API endpoint with axios
      const response = await this.apiService.axiosInstance.get(
        "/video/download",
        {
          params: {
            url,
          },
          responseType: "arraybuffer",
        }
      );

      console.log(JSON.stringify(response));

      // Extract the filename from the response headers (if present)
      let filename = "video.mp4";
      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
        const matches = /filename\*?=(?:UTF-8''|")?([^;"]+)/.exec(
          contentDisposition
        );

        if (matches && matches[1]) {
          filename = decodeURIComponent(matches[1].replace(/['"]/g, ""));
        }
      }

      // Convert response data into a Blob
      const fileBlob = new Blob([response.data], { type: "video/mp4" });

      // Create an object URL and download
      const downloadUrl = window.URL.createObjectURL(fileBlob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading video:", JSON.stringify(error, null, 2));
      throw error;
    }
  }
}
