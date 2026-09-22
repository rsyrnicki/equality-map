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
  // Reads the app's shared state directly, instead of receiving data through
  // an @Input. Any other component can inject the same service and see the
  // same selection/filters/colors — there's only ever one copy of this state.
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
