import { Component, OnInit, OnDestroy } from '@angular/core';
import { QueueService, VideoInQueue } from '../../services/queue.service';
import { Subscription, interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-queue',
  template: `
    <div *ngIf="videosInQueue.length > 0">
      <h2>Video Queue</h2>
      <ul>
        <li *ngFor="let video of videosInQueue">
          <strong>ID:</strong> {{ video.id }},
          <strong>Format:</strong> {{ video.format }},
          <strong>Quality:</strong> {{ video.quality }},
          <strong>Status:</strong> {{ video.status }}
        </li>
      </ul>
    </div>
    <div *ngIf="videosInQueue.length === 0">
        <p>The queue is empty.</p>
    </div>
  `,
  styles: []
})
export class QueueComponent implements OnInit, OnDestroy {
  videosInQueue: VideoInQueue[] = [];
  private queueSubscription: Subscription;
  private pollingSubscription: Subscription;

  constructor(private queueService: QueueService) { }

  ngOnInit(): void {
    this.updateQueue();
    this.startPolling();
  }

  ngOnDestroy(): void {
    if (this.queueSubscription) {
      this.queueSubscription.unsubscribe();
    }
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  updateQueue(): void {
    this.queueSubscription = this.queueService.getQueueStatus().subscribe(
      queue => {
        this.videosInQueue = queue;
      },
      error => {
        console.error('Error getting queue status:', error);
      }
    );
  }

  startPolling(): void {
    this.pollingSubscription = interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this.queueService.getQueueStatus())
      )
      .subscribe(
        queue => {
          this.videosInQueue = queue;
        },
        error => {
          console.error('Error polling queue status:', error);
        }
      );
  }
}