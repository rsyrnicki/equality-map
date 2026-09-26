import { ComponentFixture, TestBed } from '@angular/core/testing';
import { INITIAL_LIVE_STATE } from '../../../core/services/air-quality.service';
import { LiveStatus } from './live-status';

describe('LiveStatus', () => {
  let fixture: ComponentFixture<LiveStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveStatus],
    }).compileComponents();

    fixture = TestBed.createComponent(LiveStatus);
  });

  // This component gets everything through `input()`, so the test can set
  // those inputs directly — no services, no HTTP.
  it('shows the error message it is given', async () => {
    fixture.componentRef.setInput('state', {
      ...INITIAL_LIVE_STATE,
      status: 'error',
      error: 'Service down',
    });
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Service down');
  });

  it('emits refresh when the button is clicked', async () => {
    fixture.componentRef.setInput('state', { ...INITIAL_LIVE_STATE, status: 'ready' });
    await fixture.whenStable();
    let refreshed = false;
    fixture.componentInstance.refresh.subscribe(() => (refreshed = true));

    (fixture.nativeElement as HTMLElement).querySelector('button')!.click();

    expect(refreshed).toBe(true);
  });
});
