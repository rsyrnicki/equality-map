import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorldMap } from './world-map';

describe('WorldMap', () => {
  let component: WorldMap;
  let fixture: ComponentFixture<WorldMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorldMap],
      // The component (via MapStateService) fetches data with HttpClient. The
      // testing backend records requests instead of sending them over the network.
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(WorldMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
