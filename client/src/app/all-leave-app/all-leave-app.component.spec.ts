import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllLeaveAppComponent } from './all-leave-app.component';

describe('AllLeaveAppComponent', () => {
  let component: AllLeaveAppComponent;
  let fixture: ComponentFixture<AllLeaveAppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllLeaveAppComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllLeaveAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
