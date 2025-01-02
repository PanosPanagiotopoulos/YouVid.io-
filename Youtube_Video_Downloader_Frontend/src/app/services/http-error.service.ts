import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class HttpErrorService {
  getErrorMessage(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return "Invalid YouTube URL. Please check the URL and try again.";
      case 401:
        return "Unauthorized access. Please try again.";
      case 403:
        return "Access forbidden. You might not have permission to download this video.";
      case 404:
        return "Video not found. The video might be private or deleted.";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
        return "Server error. Please try again later.";
      case 503:
        return "Service temporarily unavailable. Please try again later.";
      default:
        return "Failed to download video. Please try again later.";
    }
  }

  getNetworkErrorMessage(error: unknown): string {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      return "Network error. Please check your connection and try again.";
    }
    return "An unexpected error occurred. Please try again.";
  }
}
