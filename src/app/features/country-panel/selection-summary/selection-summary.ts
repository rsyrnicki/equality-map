import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MapStateService } from '../../../core/services/map-state.service';

@Component({
  selector: 'app-selection-summary',
  imports: [DecimalPipe, MatCardModule, MatListModule, MatIconModule, MatButtonModule],
  templateUrl: './selection-summary.html',
  styleUrl: './selection-summary.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectionSummary {
  protected readonly state = inject(MapStateService);

  remove(iso3: string): void {
    this.state.toggleCountry(iso3);
  }
}
