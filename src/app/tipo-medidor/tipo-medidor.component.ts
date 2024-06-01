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
  selector: 'app-tipo-medidor',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, MatIconModule],
  templateUrl: './tipo-medidor.component.html',
  styleUrl: './tipo-medidor.component.css'
})
export class TipoMedidorComponent {
  idtipomedidor: string = '';
  tipomedidor: string = '';
  tarifa: string = '';
  alumbradopublico: string = '';
  cargofijo: string = '';
  addingTypeMetric: boolean = false;
  updatingTypeMetric: boolean = false;
  tipomedidores: any[] = [];

  editingMode: boolean = false;

  selectedItem: string = 'tipomedidor';
  searchTerm: string = '';

  limpiarBusqueda(): void {
    this.searchTerm = ''; // Borra el contenido del término de búsqueda
  }

  buscarPorPropiedad(tipomedidor: any): boolean {
    // Verificamos si el término de búsqueda está presente en la propiedad seleccionada
    return tipomedidor[this.selectedItem].toLowerCase().includes(this.searchTerm.toLowerCase());
  }

  constructor(private httpClient: HttpClient, private snackBar: MatSnackBar,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.mostrarTipoMedidores();
  }

  mostrarTipoMedidores() {
    this.httpClient.get<any>(`${API_BASE_URL}/api/tipomedidores`).subscribe(
      (data) => {
        console.log(data); // Verifica el tipo de datos recibidos
        this.tipomedidores = data.TipoMedidores; // Guarda los empleados en una variable local
      },
      (error) => {
        //console.error('Error al obtener empleados:', error);
      }
    );
  }

  agregarTipoMedidor() {
    if (!this.tipomedidor) {
        this.mostrarSnackBar('Por favor complete todos los campos');
        return;
    }

    // Deshabilitar el botón de agregar y mostrar "Agregando..."
    this.addingTypeMetric = true;

    this.httpClient.post<any>(`${API_BASE_URL}/api/tipomedidores`, {
        tipomedidor: this.tipomedidor,
        tarifa: this.tarifa,
        alumbradopublico : this.alumbradopublico,
        cargofijo: this.cargofijo
    }).subscribe(
        (response) => {
            this.mostrarSnackBar('Tipo de Medidor agregado exitosamente');
            this.mostrarTipoMedidores();
            this.resetCampos();
        },
        (error) => {
            console.error('Error al agregar tipo de medidor:', error);
            let errorMessage = 'Hubo un error al agregar el tipo de medidor. Por favor, inténtelo de nuevo más tarde';
            if (error.error && error.error.message) {
                errorMessage = error.error.message; // Obtener el mensaje de error del backend
            }
            this.mostrarSnackBar(errorMessage);
            this.addingTypeMetric = false; // Habilitar el botón nuevamente
        }
    );
  }

  actualizarTipoMedidor() {
    if (!this.tipomedidor) {
        this.mostrarSnackBar('Por favor complete todos los campos');
        return;
    }

    // Deshabilitar el botón de actualizar y mostrar "Actualizando..."
    this.updatingTypeMetric = true;

    this.httpClient.put<any>(`${API_BASE_URL}/api/tipomedidores/${this.idtipomedidor}`, {
        tipomedidor: this.tipomedidor,
        tarifa: this.tarifa,
        alumbradopublico : this.alumbradopublico,
        cargofijo: this.cargofijo
    }).subscribe(
        (response) => {
            this.mostrarSnackBar('Tipo de Medidor actualizado exitosamente');
            this.mostrarTipoMedidores();
            this.resetCampos();
        },
        (error) => {
            console.error('Error al actualizar el tipo de medidor:', error);
            let errorMessage = 'Hubo un error al actualizar el tipo de medidor. Por favor, inténtelo de nuevo más tarde';
            if (error.error && error.error.message) {
                errorMessage = error.error.message; // Obtener el mensaje de error del backend
            }
            this.mostrarSnackBar(errorMessage);
            this.updatingTypeMetric = false; // Habilitar el botón nuevamente
        }
    );

  }

  eliminarTipoMedidor(idtipomedidor: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: '¿Está seguro que desea eliminar definitivamente este tipo de medidor?'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.httpClient.delete<any>(`${API_BASE_URL}/api/tipomedidores/${idtipomedidor}`).subscribe(
          (response) => {
            this.mostrarSnackBar('Tipo de Medidor eliminado exitosamente');
            this.mostrarTipoMedidores();
          },
          (error) => {
            console.error('Error al eliminar el tipo de medidor:', error);
            let errorMessage = 'Hubo un error al eliminar el tipo de medidor. Por favor, inténtelo de nuevo más tarde';
            if (error.error && error.error.message) {
              errorMessage = error.error.message; // Obtener el mensaje de error del backend
            }
            this.mostrarSnackBar(errorMessage);
          }
        );
      }
    });
  }

  cargarTipoMedidorSeleccionado(tipomedidor: any) {
    // Cargar los datos del empleado seleccionado en el formulario
    this.tipomedidor = tipomedidor.tipomedidor;
    this.tarifa = tipomedidor.tarifa,
    this.alumbradopublico = tipomedidor.alumbradopublico,
    this.cargofijo= tipomedidor.cargofijo,
    this.idtipomedidor = tipomedidor.idtipomedidor;
    this.editingMode = true;
    console.log("Data", tipomedidor);
  }

  cambiarEstadoTipoMedidor(idtipomedidor: string) {
    this.httpClient.put<any>(`${API_BASE_URL}/api/estado-tipomedidores/${idtipomedidor}`, {}).subscribe(
      (response) => {
        this.mostrarSnackBar('Estado del tipo de medidor actualizado exitosamente');
        this.mostrarTipoMedidores(); // Actualiza la lista de empleados después de cambiar el estado
      },
      (error) => {
        console.error('Error al cambiar el estado del tipo de medidor:', error);
        let errorMessage = 'Hubo un error al cambiar el estado del tipo de medidor. Por favor, inténtelo de nuevo más tarde';
        if (error.error && error.error.message) {
          errorMessage = error.error.message; // Obtener el mensaje de error del backend
        }
        this.mostrarSnackBar(errorMessage);
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
    this.tipomedidor = '';
    this.tarifa = '';
    this.alumbradopublico = '';
    this.cargofijo = '';
    this.updatingTypeMetric = false;
    this.addingTypeMetric = false;
    this.editingMode = false;
  }
}
