import { Component } from '@angular/core';
import { SelectionSummary } from '../../country-panel/selection-summary/selection-summary';
import { FilterPanel } from '../../filters/filter-panel/filter-panel';
import { WorldMap } from '../world-map/world-map';

@Component({
  selector: 'app-map-page',
  imports: [WorldMap, FilterPanel, SelectionSummary],
  templateUrl: './map-page.html',
  styleUrl: './map-page.css',
})
export class MapPage {}
