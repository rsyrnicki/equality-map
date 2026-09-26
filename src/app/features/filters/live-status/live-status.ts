import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LiveState } from '../../../core/services/air-quality.service';

/**
 * Shows whether live data is loading, fresh, or failed, with a refresh button.
 *
 * Unlike the other components, this one doesn't inject MapStateService. Its
 * parent passes the state in through an `input()` and listens for clicks
 * through an `output()`, so this component only knows about `LiveState` —
 * not where it comes from, or what "refresh" actually does.
 */
@Component({
  selector: 'app-live-status',
  imports: [DatePipe, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './live-status.html',
  styleUrl: './live-status.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveStatus {
  /** `required` means the parent must bind it: `<app-live-status [state]="..." />`. */
  readonly state = input.required<LiveState>();

  /** The parent listens with `(refresh)="..."`; we trigger it with `this.refresh.emit()`. */
  readonly refresh = output<void>();
}
