import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieUploadComponent } from './movie-upload.component';

describe('MovieUploadComponent', () => {
  let component: MovieUploadComponent;
  let fixture: ComponentFixture<MovieUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieUploadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MovieUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
