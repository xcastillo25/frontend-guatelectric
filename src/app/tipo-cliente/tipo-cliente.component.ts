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
  selector: 'app-tipo-cliente',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, MatIconModule],
  templateUrl: './tipo-cliente.component.html',
  styleUrl: './tipo-cliente.component.css'
})
export class TipoClienteComponent {
  idtipocliente: string = '';
  tipocliente: string = '';
  addingTypeClient: boolean = false;
  updatingTypeClient: boolean = false;
  tipoclientes: any[] = [];

  editingMode: boolean = false;

  selectedItem: string = 'tipocliente';
  searchTerm: string = '';

  limpiarBusqueda(): void {
    this.searchTerm = ''; // Borra el contenido del término de búsqueda
  }

  buscarPorPropiedad(tipocliente: any): boolean {
    // Verificamos si el término de búsqueda está presente en la propiedad seleccionada
    return tipocliente[this.selectedItem].toLowerCase().includes(this.searchTerm.toLowerCase());
  }

  constructor(private httpClient: HttpClient, private snackBar: MatSnackBar,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.mostrarTipoClientes();
  }

  mostrarTipoClientes() {
    this.httpClient.get<any>(`${API_BASE_URL}/api/tipoclientes`).subscribe(
      (data) => {
        console.log(data); // Verifica el tipo de datos recibidos
        this.tipoclientes = data.TipoClientes; // Guarda los empleados en una variable local
      },
      (error) => {
        //console.error('Error al obtener empleados:', error);
      }
    );
  }

  agregarTipoCliente() {
    if (!this.tipocliente) {
        this.mostrarSnackBar('Por favor complete todos los campos');
        return;
    }

    // Deshabilitar el botón de agregar y mostrar "Agregando..."
    this.addingTypeClient = true;

    this.httpClient.post<any>(`${API_BASE_URL}/api/tipoclientes`, {
        tipocliente: this.tipocliente,
    }).subscribe(
        (response) => {
            this.mostrarSnackBar('Tipo de Cliente agregado exitosamente');
            this.mostrarTipoClientes();
            this.resetCampos();
        },
        (error) => {
            console.error('Error al agregar tipo de cliente:', error);
            let errorMessage = 'Hubo un error al agregar el tipo de cliente. Por favor, inténtelo de nuevo más tarde';
            if (error.error && error.error.message) {
                errorMessage = error.error.message; // Obtener el mensaje de error del backend
            }
            this.mostrarSnackBar(errorMessage);
            this.addingTypeClient = false; // Habilitar el botón nuevamente
        }
    );
  }

  actualizarTipoCliente() {
    if (!this.tipocliente) {
        this.mostrarSnackBar('Por favor complete todos los campos');
        return;
    }

    // Deshabilitar el botón de actualizar y mostrar "Actualizando..."
    this.updatingTypeClient = true;

    this.httpClient.put<any>(`${API_BASE_URL}/api/tipoclientes/${this.idtipocliente}`, {
        tipocliente: this.tipocliente
    }).subscribe(
        (response) => {
            this.mostrarSnackBar('Tipo de Cliente actualizado exitosamente');
            this.mostrarTipoClientes();
            this.resetCampos();
        },
        (error) => {
            console.error('Error al actualizar el tipo de cliente:', error);
            let errorMessage = 'Hubo un error al actualizar el tipo de cliente. Por favor, inténtelo de nuevo más tarde';
            if (error.error && error.error.message) {
                errorMessage = error.error.message; // Obtener el mensaje de error del backend
            }
            this.mostrarSnackBar(errorMessage);
            this.updatingTypeClient = false; // Habilitar el botón nuevamente
        }
    );

  }

  eliminarTipoCliente(idtipocliente: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: '¿Está seguro que desea eliminar definitivamente este tipo de cliente?'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.httpClient.delete<any>(`${API_BASE_URL}/api/tipoclientes/${idtipocliente}`).subscribe(
          (response) => {
            this.mostrarSnackBar('Tipo de Cliente eliminado exitosamente');
            this.mostrarTipoClientes();
          },
          (error) => {
            console.error('Error al eliminar el tipo de cliente:', error);
            let errorMessage = 'Hubo un error al eliminar el tipo de cliente. Por favor, inténtelo de nuevo más tarde';
            if (error.error && error.error.message) {
              errorMessage = error.error.message; // Obtener el mensaje de error del backend
            }
            this.mostrarSnackBar(errorMessage);
          }
        );
      }
    });
  }

  cargarTipoClienteSeleccionado(tipocliente: any) {
    // Cargar los datos del empleado seleccionado en el formulario
    this.tipocliente = tipocliente.tipocliente;
    this.idtipocliente = tipocliente.idtipocliente;
    this.editingMode = true;
    console.log("Data", tipocliente);
  }

  cambiarEstadoTipoCliente(idtipocliente: string) {
    this.httpClient.put<any>(`${API_BASE_URL}/api/estado-tipoclientes/${idtipocliente}`, {}).subscribe(
      (response) => {
        this.mostrarSnackBar('Estado del tipo de cliente actualizado exitosamente');
        this.mostrarTipoClientes(); // Actualiza la lista de empleados después de cambiar el estado
      },
      (error) => {
        console.error('Error al cambiar el estado del tipo de cliente:', error);
        let errorMessage = 'Hubo un error al cambiar el estado del tipo de cliente. Por favor, inténtelo de nuevo más tarde';
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
    this.tipocliente = '';
    this.updatingTypeClient = false;
    this.addingTypeClient = false;
    this.editingMode = false;
  }
}
