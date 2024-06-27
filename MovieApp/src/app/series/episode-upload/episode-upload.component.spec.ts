import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpisodeUploadComponent } from './episode-upload.component';

describe('EpisodeUploadComponent', () => {
  let component: EpisodeUploadComponent;
  let fixture: ComponentFixture<EpisodeUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpisodeUploadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EpisodeUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
