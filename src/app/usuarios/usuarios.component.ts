import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_BASE_URL } from '../app.config';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [MatIconModule, MatDialogModule, CommonModule, HttpClientModule, FormsModule,],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent {

  idusuario: string ='';
  usuario: string ='';
  password: string ='';
  confirmarPassword: string = '';
  idrol: string= '';

  addingUser: boolean = false;
  updatingUser: boolean = false;

  usuarios: any[] = [];
  roles: any[] = [];
  rolSeleccionado: any;
  editingMode: boolean = false;

  hidePassword = true;
  idRolSeleccionado: number = 0;

  constructor(
    public dialogRef: MatDialogRef<UsuariosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { idEmpleado: string, nombre: string, apellidos: string },
    private httpClient: HttpClient, private snackBar: MatSnackBar, public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.mostrarUsuarios();
    this.mostrarRoles();
  }

  mostrarUsuarios() {
    const idEmpleado = this.data.idEmpleado;
    this.httpClient.get<any>(`${API_BASE_URL}/api/usuarios/${this.data.idEmpleado}`).subscribe(
      (data) => {
        console.log(data); // Verifica el tipo de datos recibidos
        this.usuarios = data.Usuarios; // Guarda los usuarios en una variable local
      },
      (error) => {
        //console.error('Error al obtener usuarios:', error);
      }
    );
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

  agregarUsuario() {
    if (!this.usuario || !this.password || !this.confirmarPassword) {
        this.mostrarSnackBar('Por favor complete todos los campos');
        return;
    }

    if (!this.idRolSeleccionado) {
      this.mostrarSnackBar('Por favor seleccione un rol');
      return;
    }

    if (this.password !== this.confirmarPassword) {
        this.mostrarSnackBar('Las contraseñas no coinciden');
        return;
    }

    // Validar la contraseña para asegurarse de que contenga al menos una mayúscula, una minúscula y un número
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!regex.test(this.password)) {
        this.mostrarSnackBar('La contraseña debe tener al menos una mayúscula, una minúscula y un número');
        return;
    }

    // Deshabilitar el botón de agregar y mostrar "Agregando..."
    this.addingUser = true;

    const idEmpleado = this.data.idEmpleado; // Obtener el idEmpleado de los datos del modal

    this.httpClient.post<any>(`${API_BASE_URL}/api/usuarios`, {
        idempleado: idEmpleado,
        usuario: this.usuario,
        password: this.password,
        idrol: this.idRolSeleccionado,
    }).subscribe(
        (response) => {
            this.mostrarSnackBar('Usuario agregado exitosamente');
            this.mostrarUsuarios();
            this.resetCampos();
        },
        (error) => {
            console.error('Error al agregar usuario:', error);
            let errorMessage = 'Hubo un error al agregar el usuario. Por favor, inténtelo de nuevo más tarde';
            if (error.error && error.error.message) {
                errorMessage = error.error.message; // Obtener el mensaje de error del backend
            }
            this.mostrarSnackBar(errorMessage);
            this.addingUser = false; // Habilitar el botón nuevamente
        }
    );
  }

  actualizarUsuario() {
    if (!this.usuario || !this.password || !this.confirmarPassword) {
        this.mostrarSnackBar('Por favor complete todos los campos');
        return;
    }

    if (!this.idRolSeleccionado) {
      this.mostrarSnackBar('Por favor seleccione un rol');
      return;
    }

    if (this.password !== this.confirmarPassword) {
        this.mostrarSnackBar('Las contraseñas no coinciden');
        return;
    }

    // Validar la contraseña para asegurarse de que contenga al menos una mayúscula, una minúscula y un número
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!regex.test(this.password)) {
        this.mostrarSnackBar('La contraseña debe tener al menos una mayúscula, una minúscula y un número');
        return;
    }

    // Deshabilitar el botón de actualizar y mostrar "Actualizando..."
    this.updatingUser = true;

    const idEmpleado = this.data.idEmpleado; // Obtener el idEmpleado de los datos del modal

    this.httpClient.put<any>(`${API_BASE_URL}/api/usuarios/${this.idusuario}`, {
        usuario: this.usuario,
        password: this.password,
        idrol: this.idRolSeleccionado,
    }).subscribe(
        (response) => {
            this.mostrarSnackBar('Usuario actualizado exitosamente');
            this.mostrarUsuarios();
            this.resetCampos();
        },
        (error) => {
            console.error('Error al actualizar usuario:', error);
            let errorMessage = 'Hubo un error al actualizar el usuario. Por favor, inténtelo de nuevo más tarde';
            if (error.error && error.error.message) {
                errorMessage = error.error.message; // Obtener el mensaje de error del backend
            }
            this.mostrarSnackBar(errorMessage);
            this.updatingUser = false; // Habilitar el botón nuevamente
        }
    );

  }

  eliminarUsuario(idUsuario: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: '¿Está seguro que desea eliminar definitivamente su usuario?'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.httpClient.delete<any>(`${API_BASE_URL}/api/usuarios/${idUsuario}`).subscribe(
          (response) => {
            this.mostrarSnackBar('Usuario eliminado exitosamente');
            this.mostrarUsuarios();
          },
          (error) => {
            console.error('Error al eliminar usuario:', error);
            let errorMessage = 'Hubo un error al eliminar el usuario. Por favor, inténtelo de nuevo más tarde';
            if (error.error && error.error.message) {
              errorMessage = error.error.message; // Obtener el mensaje de error del backend
            }
            this.mostrarSnackBar(errorMessage);
          }
        );
      }
    });
  }

  cargarUsuarioSeleccionado(usuario: any) {
    // Cargar los datos del empleado seleccionado en el formulario
    this.usuario = usuario.usuario;
    this.idusuario = usuario.idusuario;
    this.idRolSeleccionado = usuario.idrol; // Establece el ID del rol seleccionado

    // Aquí puedes buscar el rol seleccionado en la lista de roles y establecerlo como el rol seleccionado
    // Por ejemplo:
    const rolSeleccionado = this.roles.find(rol => rol.id === usuario.idrol);
    if (rolSeleccionado) {
        this.rolSeleccionado = rolSeleccionado;
    }

    this.editingMode = true;
    console.log("Data", usuario);
}


  cambiarEstadoUsuario(idUsuario: string) {
    this.httpClient.put<any>(`${API_BASE_URL}/api/estado-usuarios/${idUsuario}`, {}).subscribe(
      (response) => {
        this.mostrarSnackBar('Estado del usuario actualizado exitosamente');
        this.mostrarUsuarios(); // Actualiza la lista de empleados después de cambiar el estado
      },
      (error) => {
        console.error('Error al cambiar el estado del usuario:', error);
        let errorMessage = 'Hubo un error al cambiar el estado del usuario. Por favor, inténtelo de nuevo más tarde';
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
    this.usuario = '';
    this.password = '';
    this.confirmarPassword = '';
    this.idRolSeleccionado = 0;
    this.updatingUser = false;
    this.addingUser = false;
    this.editingMode = false;
  }

  togglePasswordVisibility():void {
    this.hidePassword = !this.hidePassword;
  }

  cerrarModal(): void {
    this.dialogRef.close();
  }

}
