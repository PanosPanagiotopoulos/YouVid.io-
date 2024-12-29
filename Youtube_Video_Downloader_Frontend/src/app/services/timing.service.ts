import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimingService {
  async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}