import { Injectable } from "@angular/core";
import axios, { AxiosInstance } from "axios";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  axiosInstance: AxiosInstance;

  constructor() {
    const backendUrl =
      window.location.hostname === "localhost"
        ? "http://localhost:7076/api" // Local development environment
        : "http://backend-api:7076/api"; // Docker environment

    this.axiosInstance = axios.create({
      baseURL: backendUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
