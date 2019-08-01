import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllDeveloperComponent } from './all-developer.component';

describe('AllDeveloperComponent', () => {
  let component: AllDeveloperComponent;
  let fixture: ComponentFixture<AllDeveloperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllDeveloperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllDeveloperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
