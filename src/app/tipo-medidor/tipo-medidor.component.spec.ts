import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoMedidorComponent } from './tipo-medidor.component';

describe('TipoMedidorComponent', () => {
  let component: TipoMedidorComponent;
  let fixture: ComponentFixture<TipoMedidorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoMedidorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TipoMedidorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
