import { Injectable } from "@angular/core";
import { delay, Observable, Subject } from "rxjs";

export interface IframeDownloadEvent {
  type: "start" | "complete" | "error";
  id: string;
  error?: Error;
}

@Injectable({
  providedIn: "root",
})
export class IframeDownloadService {
  private downloadEvents = new Subject<IframeDownloadEvent>();
  downloadEvents$ = this.downloadEvents.asObservable();

  /**
   * Extracts the filename from the Content-Disposition header.
   * @param contentDisposition The Content-Disposition header value.
   * @returns The extracted filename or a default name if not found.
   */
  private getFilenameFromHeader(contentDisposition: string | null): string {
    if (!contentDisposition) {
      return "downloaded-file.mp4";
    }

    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
    if (filenameMatch && filenameMatch[1]) {
      const filename = filenameMatch[1];
      return filename.endsWith(".mp4") ? filename : `${filename}.mp4`;
    }

    return "downloaded-file.mp4";
  }

  /**
   * Triggers the download of a file using an iframe.
   * @param downloadUrl The URL from which to download the file.
   */
  triggerDownload(downloadUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout: number = 1000 * 60 * 15; // 15 minutes

      const downloadId: string = `download-iframe-${Date.now()}-${
        Math.random() * 10
      }`;
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.id = downloadId;

      // Extract delay setting from URL
      const url = new URL(downloadUrl, window.location.origin);
      const delaySetting = url.searchParams.get("settings");
      console.log(delaySetting);
      const completeDelay = delaySetting === "1" ? 35000 : 90000; // 35 sec or 1.5 min

      // Event listener for successful load
      iframe.onload = () => {
        // Delay to ensure download starts
        setTimeout(() => {
          this.downloadEvents.next({ type: "complete", id: downloadId });
          setTimeout(() => {
            resolve();
            this.cleanupIframe(downloadId);
          }, timeout);
        }, completeDelay);
      };

      // Event listener for errors
      iframe.onerror = () => {
        const error = new Error("Download failed to start");
        this.downloadEvents.next({ type: "error", id: downloadId, error });
        reject(error);
        this.cleanupIframe(downloadId);
      };

      // Append iframe to the body and set src to trigger download
      document.body.appendChild(iframe);
      this.downloadEvents.next({ type: "start", id: downloadId });
      iframe.src = downloadUrl;
    });
  }

  /**
   * Removes the iframe from the DOM after a short delay to ensure the download has been triggered.
   * @param iframeId The ID of the iframe to remove.
   */
  private cleanupIframe(iframeId: string): void {
    setTimeout(() => {
      const iframe = document.getElementById(iframeId);
      if (iframe) {
        document.body.removeChild(iframe);
      }
    }, 1000); // 1 second delay
  }
}
