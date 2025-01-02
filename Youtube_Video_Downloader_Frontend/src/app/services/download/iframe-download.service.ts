import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

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

  triggerDownload(downloadUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      /*const iframeId = `download-iframe-${Date.now()} ${Math.random() * 10}`;
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.id = iframeId;

      iframe.onload = () => {
        setTimeout(() => {
          this.downloadEvents.next({ type: "complete", id: iframeId });
        }, 45000);
        resolve();
        this.cleanupIframe(iframeId);
      };

      iframe.onerror = () => {
        const error = new Error("Download failed to start");
        this.downloadEvents.next({ type: "error", id: iframeId, error });
        reject(error);
        this.cleanupIframe(iframeId);
      };

      document.body.appendChild(iframe);
      this.downloadEvents.next({ type: "start", id: iframeId });
      iframe.src = downloadUrl; */

      const downloadId: string = `download-link-${Date.now()} ${
        Math.random() * 10
      }`;
      const downloadLink = document.createElement("a");

      try {
        downloadLink.href = downloadUrl;
        document.body.appendChild(downloadLink);
        downloadLink.click();

        setTimeout(() => {
          this.downloadEvents.next({ type: "complete", id: downloadId });
        }, 30000);
      } catch (error) {
        const tError: Error = error as Error;

        this.downloadEvents.next({
          type: "error",
          id: downloadId,
          error: tError,
        });
        reject(error);
      }

      document.body.removeChild(downloadLink);
    });
  }

  private cleanupIframe(iframeId: string): void {
    setTimeout(() => {
      const iframe = document.getElementById(iframeId);
      if (iframe) {
        document.body.removeChild(iframe);
      }
    }, 100);
  }
}
