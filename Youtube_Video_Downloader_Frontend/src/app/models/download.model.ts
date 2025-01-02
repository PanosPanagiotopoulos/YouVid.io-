export interface DownloadProgress {
  id: string;
  url: string;
  progress: number;
  status: "pending" | "downloading" | "completed" | "error";
  error?: string;
  filename?: string;
  startTime: number;
  lastProgressUpdate?: number;
}

export interface DownloadController {
  controller: AbortController;
}

export type Download = DownloadProgress & Partial<DownloadController>;
