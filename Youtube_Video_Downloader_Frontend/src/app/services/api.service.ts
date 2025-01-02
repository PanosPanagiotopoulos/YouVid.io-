import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  readonly backendUrl: string;

  constructor(private http: HttpClient) {
    this.backendUrl = this.getBackendUrl();
  }

  private getBackendUrl(): string {
    const hostname = window.location.hostname;
    if (hostname === "localhost") {
      return "https://localhost:7077/api";
    }
    return "https://backend-api:7077/api";
  }

  getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Accept: "video/mp4,application/octet-stream",
      "Content-Type": "application/json",
    });
  }
}
