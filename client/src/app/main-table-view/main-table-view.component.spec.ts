import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainTableViewComponent } from './main-table-view.component';

describe('MainTableViewComponent', () => {
  let component: MainTableViewComponent;
  let fixture: ComponentFixture<MainTableViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainTableViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainTableViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
