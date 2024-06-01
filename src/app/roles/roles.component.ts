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
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, MatIconModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css'
})
export class RolesComponent {
  idrol: string = '';
  rol: string = '';
  addingRole: boolean = false;
  updatingRole: boolean = false;
  roles: any[] = [];

  editingMode: boolean = false;

  selectedItem: string = 'rol';
  searchTerm: string = '';

  limpiarBusqueda(): void {
    this.searchTerm = ''; // Borra el contenido del término de búsqueda
  }

  buscarPorPropiedad(empleado: any): boolean {
    // Verificamos si el término de búsqueda está presente en la propiedad seleccionada
    return empleado[this.selectedItem].toLowerCase().includes(this.searchTerm.toLowerCase());
  }

  constructor(private httpClient: HttpClient, private snackBar: MatSnackBar,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.mostrarRoles();
  }

  mostrarRoles() {
    this.httpClient.get<any>(`${API_BASE_URL}/api/roles`).subscribe(
      (data) => {
        console.log(data); // Verifica el tipo de datos recibidos
        this.roles = data.Roles; // Guarda los empleados en una variable local
      },
      (error) => {
        //console.error('Error al obtener empleados:', error);
      }
    );
  }

  agregarRol() {
    if (!this.rol) {
        this.mostrarSnackBar('Por favor complete todos los campos');
        return;
    }

    // Deshabilitar el botón de agregar y mostrar "Agregando..."
    this.addingRole = true;

    this.httpClient.post<any>(`${API_BASE_URL}/api/roles`, {
        rol: this.rol,
    }).subscribe(
        (response) => {
            this.mostrarSnackBar('Rol agregado exitosamente');
            this.mostrarRoles();
            this.resetCampos();
        },
        (error) => {
            console.error('Error al agregar rol:', error);
            let errorMessage = 'Hubo un error al agregar el rol. Por favor, inténtelo de nuevo más tarde';
            if (error.error && error.error.message) {
                errorMessage = error.error.message; // Obtener el mensaje de error del backend
            }
            this.mostrarSnackBar(errorMessage);
            this.addingRole = false; // Habilitar el botón nuevamente
        }
    );
  }

  actualizarRol() {
    if (!this.rol) {
        this.mostrarSnackBar('Por favor complete todos los campos');
        return;
    }

    // Deshabilitar el botón de actualizar y mostrar "Actualizando..."
    this.updatingRole = true;

    this.httpClient.put<any>(`${API_BASE_URL}/api/roles/${this.idrol}`, {
        rol: this.rol
    }).subscribe(
        (response) => {
            this.mostrarSnackBar('Rol actualizado exitosamente');
            this.mostrarRoles();
            this.resetCampos();
        },
        (error) => {
            console.error('Error al actualizar rol:', error);
            let errorMessage = 'Hubo un error al actualizar el rol. Por favor, inténtelo de nuevo más tarde';
            if (error.error && error.error.message) {
                errorMessage = error.error.message; // Obtener el mensaje de error del backend
            }
            this.mostrarSnackBar(errorMessage);
            this.updatingRole = false; // Habilitar el botón nuevamente
        }
    );

  }

  eliminarRol(idRol: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: '¿Está seguro que desea eliminar definitivamente este rol?'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.httpClient.delete<any>(`${API_BASE_URL}/api/roles/${idRol}`).subscribe(
          (response) => {
            this.mostrarSnackBar('Rol eliminado exitosamente');
            this.mostrarRoles();
          },
          (error) => {
            console.error('Error al eliminar rol:', error);
            let errorMessage = 'Hubo un error al eliminar el rol. Por favor, inténtelo de nuevo más tarde';
            if (error.error && error.error.message) {
              errorMessage = error.error.message; // Obtener el mensaje de error del backend
            }
            this.mostrarSnackBar(errorMessage);
          }
        );
      }
    });
  }

  cargarRolSeleccionado(rol: any) {
    // Cargar los datos del empleado seleccionado en el formulario
    this.rol = rol.rol;
    this.idrol = rol.idrol;
    this.editingMode = true;
    console.log("Data", rol);
  }

  cambiarEstadoRol(idrol: string) {
    this.httpClient.put<any>(`${API_BASE_URL}/api/estado-roles/${idrol}`, {}).subscribe(
      (response) => {
        this.mostrarSnackBar('Estado del rol actualizado exitosamente');
        this.mostrarRoles(); // Actualiza la lista de empleados después de cambiar el estado
      },
      (error) => {
        console.error('Error al cambiar el estado del rol:', error);
        let errorMessage = 'Hubo un error al cambiar el estado del rol. Por favor, inténtelo de nuevo más tarde';
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
    this.rol = '';
    this.updatingRole = false;
    this.addingRole = false;
    this.editingMode = false;
  }
}
