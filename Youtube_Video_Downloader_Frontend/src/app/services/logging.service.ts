import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class LoggingService {
  private logPrefix = "[VideoDownloader]";

  info(message: string, data?: any) {
    console.info(`${this.logPrefix} ${message}`, data || "");
  }

  warn(message: string, data?: any) {
    console.warn(`${this.logPrefix} ${message}`, data || "");
  }

  error(message: string, error: any) {
    console.error(`${this.logPrefix} ${message}`, {
      error,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
    });
  }

  debug(message: string, data?: any) {
    console.debug(`${this.logPrefix} ${message}`, data || "");
  }

  logHttpError(error: any) {
    const errorDetails = {
      status: error?.status,
      statusText: error?.statusText,
      url: error?.url,
      message: error?.message,
      type: error?.type,
      headers: this.getHeadersLog(error?.headers),
      timestamp: new Date().toISOString(),
    };

    console.error(`${this.logPrefix} HTTP Error:`, errorDetails);
  }

  private getHeadersLog(headers: any): Record<string, string> {
    if (!headers) return {};

    const headerLog: Record<string, string> = {};
    headers.keys().forEach((key: string) => {
      headerLog[key] = headers.get(key);
    });
    return headerLog;
  }
}
