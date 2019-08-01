import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitUserProfileComponent } from './visit-user-profile.component';

describe('VisitUserProfileComponent', () => {
  let component: VisitUserProfileComponent;
  let fixture: ComponentFixture<VisitUserProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisitUserProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisitUserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
