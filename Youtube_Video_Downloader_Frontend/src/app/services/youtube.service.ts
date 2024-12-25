import { Injectable } from "@angular/core";
import axios from "axios";

@Injectable({
  providedIn: "root",
})
export class YoutubeService {
  constructor() {}

  // This method uses axios and directly handles the file download
  async downloadVideo(url: string): Promise<void> {
    try {
      // Call the API endpoint with axios
      const response = await axios.get(
        `https://localhost:7076/api/video/download?url=${encodeURIComponent(
          url
        )}`,
        {
          responseType: "arraybuffer", // Receive binary data
        }
      );

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
      console.error("Error downloading video:", error);
      throw error;
    }
  }
}
