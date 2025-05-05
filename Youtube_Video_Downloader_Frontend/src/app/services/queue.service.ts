import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface VideoInQueue {
  id: string;
  format: string;
  quality: string;
  status: 'pending' | 'downloading' | 'finished' | 'error';
}

export interface QueueStatus {
  queue: VideoInQueue[];
}

@Injectable({
  providedIn: 'root'
})
export class QueueService {

  constructor(private apiService: ApiService) { }

  getQueueStatus(): Observable<QueueStatus> {
    return this.apiService.getQueueStatus();
  }

  getVideoQueueStatus(videoId: string): Observable<VideoInQueue> {
    return this.apiService.getVideoQueueStatus(videoId);
  }

  addVideoToQueue(videoId: string, format: string, quality: string): Observable<VideoInQueue> {
    return this.apiService.downloadVideoChunk(videoId, format, quality);
  }
}