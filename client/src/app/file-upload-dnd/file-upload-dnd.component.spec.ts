import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadDndComponent } from './file-upload-dnd.component';

describe('FileUploadDndComponent', () => {
  let component: FileUploadDndComponent;
  let fixture: ComponentFixture<FileUploadDndComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileUploadDndComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadDndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
