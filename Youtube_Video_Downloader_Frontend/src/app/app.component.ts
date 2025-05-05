import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <button (click)="toggleQueue()">{{ showQueue ? 'Hide queue' : 'Show queue' }}</button>
      <app-queue *ngIf="showQueue"></app-queue>
    </div>
  `,
  styles: []
})
export class AppComponent {
  showQueue = false;

  toggleQueue() {
    this.showQueue = !this.showQueue;
  }
}