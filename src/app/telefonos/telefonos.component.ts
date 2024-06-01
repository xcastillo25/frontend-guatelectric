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
  selector: 'app-telefonos',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, MatIconModule],
  templateUrl: './telefonos.component.html',
  styleUrl: './telefonos.component.css'
})
export class TelefonosComponent {
  idtelefono: string = '';
  telefono: string = '';
  addingTelephone: boolean = false;
  updatingTelephone: boolean = false;
  telefonos: any[] = [];

  editingMode: boolean = false;

  selectedItem: string = 'telefono';
  searchTerm: string = '';

  limpiarBusqueda(): void {
    this.searchTerm = ''; // Borra el contenido del término de búsqueda
  }

  buscarPorPropiedad(telefono: any): boolean {
    // Verificamos si el término de búsqueda está presente en la propiedad seleccionada
    return telefono[this.selectedItem].toLowerCase().includes(this.searchTerm.toLowerCase());
  }

  constructor(private httpClient: HttpClient, private snackBar: MatSnackBar,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.mostrarTelefonos();
  }

  mostrarTelefonos() {
    this.httpClient.get<any>(`${API_BASE_URL}/api/telefonos`).subscribe(
      (data) => {
        console.log(data); // Verifica el tipo de datos recibidos
        this.telefonos = data.Telefonos; // Guarda los empleados en una variable local
      },
      (error) => {
        //console.error('Error al obtener empleados:', error);
      }
    );
  }

  agregarTelefono() {
    if (!this.telefono) {
        this.mostrarSnackBar('Por favor complete todos los campos');
        return;
    }

    // Deshabilitar el botón de agregar y mostrar "Agregando..."
    this.addingTelephone = true;

    this.httpClient.post<any>(`${API_BASE_URL}/api/telefonos`, {
        telefono: this.telefono,
    }).subscribe(
        (response) => {
            this.mostrarSnackBar('Telefono agregado exitosamente');
            this.mostrarTelefonos();
            this.resetCampos();
        },
        (error) => {
            console.error('Error al agregar teléfono:', error);
            let errorMessage = 'Hubo un error al agregar el teléfono. Por favor, inténtelo de nuevo más tarde';
            if (error.error && error.error.message) {
                errorMessage = error.error.message; // Obtener el mensaje de error del backend
            }
            this.mostrarSnackBar(errorMessage);
            this.addingTelephone = false; // Habilitar el botón nuevamente
        }
    );
  }

  actualizarTelefono() {
    if (!this.telefono) {
        this.mostrarSnackBar('Por favor complete todos los campos');
        return;
    }

    // Deshabilitar el botón de actualizar y mostrar "Actualizando..."
    this.updatingTelephone = true;

    this.httpClient.put<any>(`${API_BASE_URL}/api/telefonos/${this.idtelefono}`, {
        telefono: this.telefono
    }).subscribe(
        (response) => {
            this.mostrarSnackBar('Teléfono actualizado exitosamente');
            this.mostrarTelefonos();
            this.resetCampos();
        },
        (error) => {
            console.error('Error al actualizar teléfono:', error);
            let errorMessage = 'Hubo un error al actualizar el teléfono. Por favor, inténtelo de nuevo más tarde';
            if (error.error && error.error.message) {
                errorMessage = error.error.message; // Obtener el mensaje de error del backend
            }
            this.mostrarSnackBar(errorMessage);
            this.updatingTelephone = false; // Habilitar el botón nuevamente
        }
    );

  }

  eliminarTelefono(idtelefono: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: '¿Está seguro que desea eliminar definitivamente este teléfono?'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.httpClient.delete<any>(`${API_BASE_URL}/api/telefonos/${idtelefono}`).subscribe(
          (response) => {
            this.mostrarSnackBar('Teléfono eliminado exitosamente');
            this.mostrarTelefonos();
          },
          (error) => {
            console.error('Error al eliminar teléfono:', error);
            let errorMessage = 'Hubo un error al eliminar el teléfono. Por favor, inténtelo de nuevo más tarde';
            if (error.error && error.error.message) {
              errorMessage = error.error.message; // Obtener el mensaje de error del backend
            }
            this.mostrarSnackBar(errorMessage);
          }
        );
      }
    });
  }

  cargarTelefonoSeleccionado(telefono: any) {
    // Cargar los datos del empleado seleccionado en el formulario
    this.telefono = telefono.telefono;
    this.idtelefono = telefono.idtelefono;
    this.editingMode = true;
    console.log("Data", telefono);
  }

  cambiarEstadoTelefono(idtelefono: string) {
    this.httpClient.put<any>(`${API_BASE_URL}/api/estado-telefonos/${idtelefono}`, {}).subscribe(
      (response) => {
        this.mostrarSnackBar('Estado del teléfono actualizado exitosamente');
        this.mostrarTelefonos(); // Actualiza la lista de empleados después de cambiar el estado
      },
      (error) => {
        console.error('Error al cambiar el estado del teléfono:', error);
        let errorMessage = 'Hubo un error al cambiar el estado del teléfono. Por favor, inténtelo de nuevo más tarde';
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
    this.telefono = '';
    this.updatingTelephone = false;
    this.addingTelephone = false;
    this.editingMode = false;
  }
}
