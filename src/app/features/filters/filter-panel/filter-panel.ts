import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipListboxChange, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CONTINENT_LABEL, ContinentCode } from '../../../core/models/continent.model';
import { MapStateService } from '../../../core/services/map-state.service';
import { LiveStatus } from '../live-status/live-status';

const CONTINENTS = (Object.keys(CONTINENT_LABEL) as ContinentCode[]).map((code) => ({
  code,
  label: CONTINENT_LABEL[code],
}));

@Component({
  selector: 'app-filter-panel',
  imports: [
    MatChipsModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    LiveStatus,
  ],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterPanel {
  protected readonly state = inject(MapStateService);
  protected readonly continents = CONTINENTS;

  // Local UI state for the ranking controls. We only push a value into
  // MapStateService once ranking is switched on -- that way the direction
  // and count controls stay usable while it's off, without affecting the map.
  protected readonly rankingEnabled = signal(false);
  protected readonly rankingDirection = signal<'top' | 'bottom'>('top');
  protected readonly rankingCount = signal(10);

  onContinentChange(event: MatChipListboxChange): void {
    this.state.setContinentFilter(event.value as ContinentCode | 'ALL');
  }

  onIndicatorChange(event: MatSelectChange): void {
    this.state.setActiveIndicator(event.value as string);
  }

  onRankingEnabledChange(event: MatSlideToggleChange): void {
    this.rankingEnabled.set(event.checked);
    this.applyRanking();
  }

  onRankingDirectionChange(event: MatButtonToggleChange): void {
    this.rankingDirection.set(event.value as 'top' | 'bottom');
    this.applyRanking();
  }

  onRankingCountChange(count: number): void {
    if (!Number.isFinite(count) || count < 1) return;
    this.rankingCount.set(count);
    this.applyRanking();
  }

  private applyRanking(): void {
    this.state.setTopNFilter(
      this.rankingEnabled() ? { direction: this.rankingDirection(), n: this.rankingCount() } : null,
    );
  }
}
