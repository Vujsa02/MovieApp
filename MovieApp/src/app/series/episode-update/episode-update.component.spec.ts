import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpisodeUpdateComponent } from './episode-update.component';

describe('EpisodeUpdateComponent', () => {
  let component: EpisodeUpdateComponent;
  let fixture: ComponentFixture<EpisodeUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpisodeUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EpisodeUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
