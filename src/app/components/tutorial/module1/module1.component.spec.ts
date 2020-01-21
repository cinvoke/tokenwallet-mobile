import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Module1Component } from './module1.component';

describe('Module1Component', () => {
  let component: Module1Component;
  let fixture: ComponentFixture<Module1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Module1Component ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Module1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
