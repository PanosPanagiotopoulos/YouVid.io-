import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class QualityTranslatorService {
  private qualityMap: Record<string, string> = {
    τοβιντεο: "normal",
    τοκαλυτεροβιντεο: "enhanced",
  };

  normalizeQuality(quality: string): string {
    // Remove all non-letter characters and convert to uppercase
    const normalized = quality.replace(/[^a-zA-Zα-ωΑ-Ω]/g, "").toLowerCase();

    // If it's already in English and normalized, return it
    if (/[A-Za-z]/.test(normalized)) {
      return normalized;
    }

    // Try to map from Greek to English
    return this.qualityMap[normalized] || "normal";
  }
}
