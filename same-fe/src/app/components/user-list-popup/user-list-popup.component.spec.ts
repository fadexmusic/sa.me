import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserListPopupComponent } from './user-list-popup.component';

describe('UserListPopupComponent', () => {
  let component: UserListPopupComponent;
  let fixture: ComponentFixture<UserListPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserListPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
