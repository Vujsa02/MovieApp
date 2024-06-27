import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeriesUploadComponent } from './series-upload.component';

describe('SeriesUploadComponent', () => {
  let component: SeriesUploadComponent;
  let fixture: ComponentFixture<SeriesUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeriesUploadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SeriesUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
