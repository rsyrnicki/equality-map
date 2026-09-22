import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Country } from '../../../core/models/country.model';
import { MapStateService } from '../../../core/services/map-state.service';

@Component({
  selector: 'app-world-map',
  imports: [],
  templateUrl: './world-map.html',
  styleUrl: './world-map.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorldMap {
  // Now that there's a shared state service, the map injects it directly
  // instead of taking `countries` as an @Input and bubbling selection up
  // through an @Output — there's no parent component in between that needs
  // to know about map internals.
  protected readonly state = inject(MapStateService);

  protected readonly countries = this.state.filteredCountries;

  toggle(country: Country): void {
    this.state.toggleCountry(country.iso3);
  }

  isSelected(country: Country): boolean {
    return this.state.isSelected(country.iso3);
  }

  colorFor(country: Country): string {
    return this.state.colorFor(country.iso3);
  }
}
