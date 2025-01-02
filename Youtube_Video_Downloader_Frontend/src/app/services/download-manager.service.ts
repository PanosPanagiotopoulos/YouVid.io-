import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Download, DownloadProgress } from "../models/download.model";

@Injectable({
  providedIn: "root",
})
export class DownloadManagerService {
  downloads = new BehaviorSubject<Download[]>([]);
  downloads$ = this.downloads.asObservable();

  addDownload(url: string): string {
    const id = crypto.randomUUID();
    const downloads = this.downloads.value;
    const newDownload: Download = {
      id,
      url,
      progress: 0,
      status: "pending",
      startTime: Date.now(),
      lastProgressUpdate: Date.now(),
    };
    downloads.push(newDownload);
    this.downloads.next(downloads);
    return id;
  }

  updateDownload(
    id: string,
    update: Partial<DownloadProgress> & { controller?: AbortController }
  ) {
    const downloads = this.downloads.value;
    const index = downloads.findIndex((d) => d.id === id);
    if (index !== -1) {
      downloads[index] = {
        ...downloads[index],
        ...update,
        lastProgressUpdate: Date.now(),
      };
      this.downloads.next([...downloads]);
    }
  }

  getDownload(id: string): Download | undefined {
    return this.downloads.value.find((d) => d.id === id);
  }

  removeDownload(id: string) {
    const download = this.getDownload(id);
    if (download?.controller) {
      download.controller.abort();
    }
    const downloads = this.downloads.value.filter((d) => d.id !== id);
    this.downloads.next(downloads);
  }

  checkStalledDownloads() {
    const now = Date.now();
    const downloads = this.downloads.value;
    let hasChanges = false;

    downloads.forEach((download) => {
      if (
        download.status === "downloading" &&
        download.lastProgressUpdate &&
        now - download.lastProgressUpdate > 600000
      ) {
        download.status = "error";
        download.error = "Download stalled. Please try again.";
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.downloads.next([...downloads]);
    }
  }
}
