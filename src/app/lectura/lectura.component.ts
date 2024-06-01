import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_BASE_URL } from '../app.config';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-lectura',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, MatIconModule],
  templateUrl: './lectura.component.html',
  styleUrl: './lectura.component.css'
})
export class LecturaComponent {
  private _lectura_actual: string = '';
  private _tarifa: number = 0;

  public get lectura_actual(): string {
    return this._lectura_actual;
  }
  public set lectura_actual(value: string) {
    this._lectura_actual = value;
    this.calculaConsumo();  // Recalcula cuando lectura actual cambia
  }

  public get tarifa(): number {
    return this._tarifa;
  }
  public set tarifa(value: number) {
    this._tarifa = value;
    this.calculaConsumo();  // Recalcula cuando tarifa cambia
  }

  nombre_completo: string = '';
  nombre: string = '';
  apellidos: string = '';
  direccion: string = '';
  serie: string = '';
  codigo: string = '';
  idmedidor: string = '';
  idcliente: string = '';
  idtipomedidor: string = '';
  tipomedidor: string = '';
  alumbradopublico: string = '';
  cargofijo: string = '';

  idconsumo_consumo: string= '';
  idcliente_consumo: string= '';
  idmedidor_consumo: string= '';
  mes: number = new Date().getMonth() + 1;
  mes_anterior: number = 0;
  anio_anterior: number = 0;
  anio: number = new Date().getFullYear();
  consumokw: number = 0;
  monto: number = 0;
  cuotaalumbrado: string = '';
  leido: string = '';
  facturado: string = '';
  lectura_anterior: string = '';
  fecha_lectura: Date = new Date();

  search_codigo: string = '';
  searchingRead: boolean = false;
  addingConsum: boolean = false;

  viewmapeo: any[] = [];
  cosumos: any[] = [];

  ngOnInit(): void {

  }

  constructor(private httpClient: HttpClient, private snackBar: MatSnackBar,
    public dialog: MatDialog) { }

  buscarPorCodigo() {
    if (!this.search_codigo.trim()) {
      this.mostrarSnackBar("Por favor ingrese un código válido");
      return;
    }

    this.searchingRead = true;

    this.httpClient.get<any>(`${API_BASE_URL}/api/viewmapeo/${this.search_codigo}`).subscribe(
      (data) => {
        if (data && data.resultados.length > 0) {
          const resultado = data.resultados[0];
          this.nombre = resultado.nombre;
          this.apellidos = resultado.apellidos;
          this.direccion = resultado.direccion;
          this.serie = resultado.serie;
          this.codigo = resultado.codigo;
          this.idmedidor = resultado.idmedidor;
          this.idcliente = resultado.idcliente;
          this.idtipomedidor = resultado.idtipomedidor;
          this.tipomedidor = resultado.idtipomedidor;
          this.alumbradopublico = resultado.alumbradopublico;
          this.cargofijo = resultado.cargofijo;
          this.tarifa = parseFloat(resultado.tarifa);
          this.mostrarSnackBar("Registro encontrado.");
          this.buscarUltimoConsumo(resultado.idmedidor);
          this.searchingRead = false;
          console.log("dagos", data);
        } else {
          this.mostrarSnackBar("No se encontraron registros con el código proporcionado.");
          this.searchingRead = false;
        }
      },
      (error) => {
        console.error('Error al obtener información:', error);
        this.mostrarSnackBar('Error al realizar la búsqueda.');
        this.searchingRead = false;
      }
    );
  }

  buscarUltimoConsumo(idmedidor: string) {

    this.httpClient.get<any>(`${API_BASE_URL}/api/ultimo-consumo/${idmedidor}`).subscribe(
      (data) => {
        if (data) {
          const consumo = data;
          this.idconsumo_consumo = consumo.idconsumo;
          this.idcliente_consumo = consumo.idcliente;
          this.idmedidor_consumo = consumo.idmedidor;
          this.mes_anterior = consumo.mes || 0;
          this.anio_anterior = consumo.anio || 0;
          this.leido = consumo.leido;
          this.facturado = consumo.facturado;
          this.lectura_anterior = consumo.lectura_actual || '0'; // Esta debería ser la última lectura actual registrada
          this.lectura_actual = '';
        } else {
          this.mostrarSnackBar("No se encontraron registros con el id del consumo proporcionado.");
          this.calculaConsumo();
        }
      },
      (error) => {
        console.error('Error al obtener información:', error);
        this.lectura_anterior = "0";
        //this.mostrarSnackBar('Error al realizar la búsqueda.');
        this.calculaConsumo();
      }
    );
  }

  calculaConsumo() {
    const actual = parseFloat(this.lectura_actual);
    const anterior = parseFloat(this.lectura_anterior);
    this.consumokw = Math.max(0, actual - anterior);
    this.monto = this.consumokw * this.tarifa;
  }

  agregarConsumo() {

    if (!this.codigo || !this.nombre || !this.apellidos || !this.direccion
      || !this.lectura_actual ||!this.lectura_anterior || !this.cargofijo
      || !this.monto || !this.mes || !this.anio || !this.alumbradopublico
    ) {
        this.mostrarSnackBar('Por favor complete todos los campos');
        return;
    }

    const mesActual = new Date().getMonth() + 1;
    const anioActual = new Date().getFullYear();

    // Validar que el mes y el año sean iguales o posteriores al último consumo
    if (this.anio < this.anio_anterior || (this.anio === this.anio_anterior && this.mes <= this.mes_anterior)) {
      this.mostrarSnackBar('No puede registrar un consumo para un mes anterior al último registro.');
      return;
    }

    // Validar que la lectura actual no sea menor que la lectura anterior
    if (parseFloat(this.lectura_actual) < parseFloat(this.lectura_anterior)) {
      this.mostrarSnackBar('La lectura actual no puede ser menor que la lectura anterior.');
      return;
    }

    // Deshabilitar el botón de agregar y mostrar "Agregando..."
    this.addingConsum = true;

    console.log("lectura anterior $$", this.lectura_anterior)
    this.httpClient.post<any>(`${API_BASE_URL}/api/consumos`, {
        idcliente: this.idcliente,
        idmedidor: this.idmedidor,
        mes: this.mes,
        anio: this.anio,
        consumokw: this.consumokw,
        monto: this.monto,
        cuotaalumbrado: this.alumbradopublico,
        leido: true,
        lectura_actual : this.lectura_actual,
        lectura_anterior : this.lectura_anterior,
        pagado: false,
        fecha_lectura: this.fecha_lectura.toISOString(),
        facturado: false,
        cargofijo: this.cargofijo
    }).subscribe(
        (response) => {
            this.mostrarSnackBar('Consumo agregado exitosamente');
            this.resetCampos();
        },
        (error) => {
            console.error('Error al agregar el cliente:', error);
            let errorMessage = 'Hubo un error al agregar el cliente. Por favor, inténtelo de nuevo más tarde';
            if (error.error && error.error.message) {
                errorMessage = error.error.message; // Obtener el mensaje de error del backend
            }
            this.mostrarSnackBar(errorMessage);
            this.addingConsum = false; // Habilitar el botón nuevamente
        }
    );
  }

  mostrarSnackBar(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
      panelClass: ['my-custom-snackbar'], // Clase CSS personalizada
    politeness: 'polite',
    });
  }

  resetCampos() {
    this.codigo = '';
    this.nombre = '';
    this.apellidos = '';
    this.direccion = '';
    this.lectura_actual = '';
    this.lectura_anterior = '';
    this.consumokw = 0;
    this.monto = 0;
    this.idcliente = '';
    this.idmedidor = '';
    this.cuotaalumbrado = '';
    this.alumbradopublico = '';
    this.cargofijo = '';
    this.search_codigo = '';
    this.mes = new Date().getMonth() + 1;
    this.anio = new Date().getFullYear();
    this.addingConsum = false;
  }
}
