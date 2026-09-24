import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectionSummary } from './selection-summary';

describe('SelectionSummary', () => {
  let component: SelectionSummary;
  let fixture: ComponentFixture<SelectionSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectionSummary],
      // The component (via MapStateService) fetches data with HttpClient. The
      // testing backend records requests instead of sending them over the network.
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectionSummary);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
