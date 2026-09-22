import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectionSummary } from './selection-summary';

describe('SelectionSummary', () => {
  let component: SelectionSummary;
  let fixture: ComponentFixture<SelectionSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectionSummary],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectionSummary);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
