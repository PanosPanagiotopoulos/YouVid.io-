import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable } from "rxjs";
import { DownloadManagerService } from "./download-manager.service";
import { Download } from "../models/download.model";

@Injectable({
  providedIn: "root",
})
export class DownloadLimitService {
  private readonly MAX_DOWNLOADS = 3;
  private showLimitPopup = new BehaviorSubject<boolean>(false);
  showLimitPopup$ = this.showLimitPopup.asObservable();

  constructor(private downloadManager: DownloadManagerService) {}

  canAddDownload(): Observable<boolean> {
    return this.downloadManager.downloads$.pipe(
      map((downloads) => {
        const activeDownloads = downloads.filter(
          (download: Download) =>
            download.status === "downloading" || download.status === "pending"
        ).length;
        return activeDownloads < this.MAX_DOWNLOADS;
      })
    );
  }

  showLimitExceededPopup(): void {
    this.showLimitPopup.next(true);
    setTimeout(() => {
      this.showLimitPopup.next(false);
    }, 2750);
  }
}
