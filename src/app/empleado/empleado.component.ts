import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_BASE_URL } from '../app.config';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { UsuariosComponent } from '../usuarios/usuarios.component';

@Component({
  selector: 'app-empleado',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, MatIconModule],
  providers: [],
  templateUrl: './empleado.component.html',
  styleUrl: './empleado.component.css'
})
export class EmpleadoComponent {
  idempleado: string = '';
  nombre: string = '';
  apellidos: string = '';
  telefono: string = '';
  nit: string = '';
  cui: string = '';
  email: string = '';
  imageUrl: string | null = null;
  selectedFile: File | null = null;
  addingEmployee: boolean = false;
  updatingEmployee: boolean = false;

  empleados: any[] = [];
  idempresa: string = '';
  miempresa: any = {};
  editingMode: boolean = false;

  selectedItem: string = 'nombre';
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
    this.mostrarEmpleados(); // Llama al método mostrarEmpleados() al inicializar el componente
    this.mostrarEmpresas();
  }

  mostrarEmpleados() {
    this.httpClient.get<any>(`${API_BASE_URL}/api/empleados`).subscribe(
      (data) => {
        console.log(data); // Verifica el tipo de datos recibidos
        this.empleados = data.Empleados; // Guarda los empleados en una variable local
      },
      (error) => {
        //console.error('Error al obtener empleados:', error);
      }
    );
  }

  mostrarEmpresas() {
    this.httpClient.get<any>(`${API_BASE_URL}/api/empresas`).subscribe(
      (data) => {
        console.log(data); // Verifica el tipo de datos recibidos
        if (data && data.Empresa) {
          this.miempresa = data.Empresa;
        }
      },
      (error) => {
        //console.error('Error al obtener empresas:', error);
      }
    );
  }

  subirImagenACloudinary(formData: FormData): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.httpClient.post<any>(`${API_BASE_URL}/api/photo-upload`, formData)
        .subscribe(
          (response) => {
            if (response && response.cloudinaryURL) {
              resolve(response.cloudinaryURL);
            } else {
              reject('La carga de la imagen a Cloudinary falló');
            }
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  agregarEmpleado() {
    if (!this.nombre || !this.apellidos || !this.telefono || !this.nit || !this.cui || !this.email || !this.selectedFile) {
      this.mostrarSnackBar('Por favor complete todos los campos y cargue una foto');
      return;
    }

    // Validación del teléfono (8 dígitos)
    if (this.telefono.length !== 8 || isNaN(Number(this.telefono))) {
      this.mostrarSnackBar('Por favor ingrese un número de teléfono válido (8 dígitos)');
      return;
    }

    // Validación del CUI (13 dígitos)
    if (this.cui.length !== 13 || isNaN(Number(this.cui))) {
      this.mostrarSnackBar('Por favor ingrese un CUI válido (13 dígitos)');
      return;
    }

    // Validación del correo electrónico
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.email)) {
      this.mostrarSnackBar('Por favor ingrese un correo electrónico válido');
      return;
    }

    // Deshabilitar el botón de agregar y mostrar "Agregando..."
    this.addingEmployee = true;

    const formData = new FormData();
    formData.append('nombre', this.nombre);
    formData.append('apellidos', this.apellidos);
    formData.append('telefono', this.telefono);
    formData.append('nit', this.nit);
    formData.append('cui', this.cui);
    formData.append('email', this.email);
    formData.append('idempresa', this.miempresa.idempresa.toString());
    formData.append('photo', this.selectedFile);

    this.subirImagenACloudinary(formData)
      .then((cloudinaryUrl: string) => {
        this.crearEmpleado(cloudinaryUrl);
      })
      .catch((error: any) => {
        console.error('Error al subir la imagen a Cloudinary:', error);
        this.mostrarSnackBar('Hubo un error al subir la imagen. Por favor, inténtelo de nuevo');
        // Habilitar el botón de agregar
        this.addingEmployee = false;
      });
  }

  crearEmpleado(imageUrl: string) {
    this.httpClient.post<any>(`${API_BASE_URL}/api/empleados`, {
      nombre: this.nombre,
      apellidos: this.apellidos,
      telefono: this.telefono,
      nit: this.nit,
      cui: this.cui,
      email: this.email,
      idempresa: this.miempresa.idempresa,
      foto: imageUrl
    }).subscribe(
      (response) => {
        this.mostrarSnackBar('Empleado agregado exitosamente');
        this.mostrarEmpleados();
        this.resetCampos();
      },
      (error) => {
        console.error('Error al agregar empleado:', error);
        let errorMessage = 'Hubo un error al agregar el empleado. Por favor, inténtelo de nuevo más tarde';
        if (error.error && error.error.message) {
          errorMessage = error.error.message; // Obtener el mensaje de error del backend
        }
        this.mostrarSnackBar(errorMessage);
        this.addingEmployee = false; // Habilitar el botón nuevamente
      }
    );
  }

  actualizarEmpleado() {
    // Verificar si todos los campos necesarios están completos
    if (!this.nombre || !this.apellidos || !this.telefono || !this.nit || !this.cui || !this.email) {
        this.mostrarSnackBar('Por favor complete todos los campos');
        return;
    }

    // Validación del teléfono (8 dígitos)
    if (this.telefono.length !== 8 || isNaN(Number(this.telefono))) {
        this.mostrarSnackBar('Por favor ingrese un número de teléfono válido (8 dígitos)');
        return;
    }

    // Validación del CUI (13 dígitos)
    if (this.cui.length !== 13 || isNaN(Number(this.cui))) {
        this.mostrarSnackBar('Por favor ingrese un CUI válido (13 dígitos)');
        return;
    }

    // Validación del correo electrónico
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.email)) {
        this.mostrarSnackBar('Por favor ingrese un correo electrónico válido');
        return;
    }

    // Deshabilitar el botón de actualizar y mostrar "Actualizando..."
    this.updatingEmployee = true;

    // Si no se selecciona un nuevo archivo, simplemente editar el empleado con la URL existente
    if (!this.selectedFile) {
      if (typeof this.imageUrl === 'string') {
          this.editarEmpleado(this.imageUrl); // Llamar a editarEmpleado solo si imageUrl es una cadena
      } else {
          console.error('La URL de la imagen no es una cadena.');
          this.mostrarSnackBar('Error al editar el empleado. Por favor, inténtelo de nuevo más tarde');
          this.updatingEmployee = false; // Habilitar el botón de actualizar nuevamente
      }
      return;
  }

    // Crear un objeto FormData para enviar los datos al servidor
    const formData = new FormData();
    formData.append('nombre', this.nombre);
    formData.append('apellidos', this.apellidos);
    formData.append('telefono', this.telefono);
    formData.append('nit', this.nit);
    formData.append('cui', this.cui);
    formData.append('email', this.email);
    formData.append('idempresa', this.miempresa.idempresa.toString());
    formData.append('photo', this.selectedFile);

    // Subir la imagen a Cloudinary y luego llamar a la función para editar el empleado
    this.subirImagenACloudinary(formData)
        .then((cloudinaryUrl: string) => {
            this.editarEmpleado(cloudinaryUrl);
        })
        .catch((error: any) => {
            console.error('Error al subir la imagen a Cloudinary:', error);
            this.mostrarSnackBar('Hubo un error al subir la imagen. Por favor, inténtelo de nuevo');
            // Habilitar el botón de actualizar
            this.updatingEmployee = false;
        });
  }

  editarEmpleado(imageUrl: string) {
      // Enviar una solicitud PUT al servidor para actualizar el empleado
      this.httpClient.put<any>(`${API_BASE_URL}/api/empleados/${this.idempleado}`, {
          nombre: this.nombre,
          apellidos: this.apellidos,
          telefono: this.telefono,
          nit: this.nit,
          cui: this.cui,
          email: this.email,
          idempresa: this.miempresa.idempresa,
          foto: imageUrl
      }).subscribe(
          (response) => {
              this.mostrarSnackBar('Empleado actualizado exitosamente');
              this.mostrarEmpleados();
              this.resetCampos();
          },
          (error) => {
              console.error('Error al actualizar empleado:', error);
              let errorMessage = 'Hubo un error al actualizar el empleado. Por favor, inténtelo de nuevo más tarde';
              if (error.error && error.error.message) {
                  errorMessage = error.error.message; // Obtener el mensaje de error del backend
              }
              this.mostrarSnackBar(errorMessage);
              this.updatingEmployee = false; // Habilitar el botón de actualizar nuevamente
          }
      );
  }

  eliminarEmpleado(idEmpleado: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: '¿Está seguro que desea eliminar definitivamente su empleado?'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.httpClient.delete<any>(`${API_BASE_URL}/api/empleados/${idEmpleado}`).subscribe(
          (response) => {
            this.mostrarSnackBar('Empleado eliminado exitosamente');
            this.mostrarEmpleados();
          },
          (error) => {
            console.error('Error al eliminar empleado:', error);
            let errorMessage = 'Hubo un error al eliminar el empleado. Por favor, inténtelo de nuevo más tarde';
            if (error.error && error.error.message) {
              errorMessage = error.error.message; // Obtener el mensaje de error del backend
            }
            this.mostrarSnackBar(errorMessage);
          }
        );
      }
    });
  }

  cargarEmpleadoSeleccionado(empleado: any) {
      // Cargar los datos del empleado seleccionado en el formulario
      this.nombre = empleado.nombre;
      this.apellidos = empleado.apellidos;
      this.telefono = empleado.telefono;
      this.nit = empleado.nit;
      this.cui = empleado.cui;
      this.email = empleado.email;
      if (empleado.foto) {
        this.imageUrl = empleado.foto; // Asignar la URL de la foto a imageUrl
      } else {
        this.imageUrl = null; // Limpiar la imagen si no hay ninguna
      }
      this.idempleado = empleado.idempleado;
      this.editingMode = true;
      console.log("Data", empleado);
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imageUrl = reader.result as string;
      };
    }
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

  mostrarConfirmacionEliminar() {
    const snackBarRef = this.snackBar.open('¿Está seguro que desea eliminar definitivamente su empleado?', 'Aceptar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });

    snackBarRef.onAction().subscribe(() => {
      //this.eliminarEmpleado(); // Lógica para eliminar el empleado
    });
  }

  abrirModalConfirmacion(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: '¿Está seguro que desea eliminar definitivamente su empleado?'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Lógica para eliminar el empleado
      } else {
        // Lógica si se cancela la eliminación
      }
    });
  }

  cambiarEstadoEmpleado(idEmpleado: string) {
    this.httpClient.put<any>(`${API_BASE_URL}/api/estado-empleados/${idEmpleado}`, {}).subscribe(
      (response) => {
        this.mostrarSnackBar('Estado del empleado actualizado exitosamente');
        this.mostrarEmpleados(); // Actualiza la lista de empleados después de cambiar el estado
      },
      (error) => {
        console.error('Error al cambiar el estado del empleado:', error);
        let errorMessage = 'Hubo un error al cambiar el estado del empleado. Por favor, inténtelo de nuevo más tarde';
        if (error.error && error.error.message) {
          errorMessage = error.error.message; // Obtener el mensaje de error del backend
        }
        this.mostrarSnackBar(errorMessage);
      }
    );
  }

  abrirModalAgregarUsuario(idEmpleado: string, nombre: string, apellidos: string): void {
    const dialogRef = this.dialog.open(UsuariosComponent, {
      width: '400px',
      data: { idEmpleado: idEmpleado, nombre: nombre, apellidos: apellidos }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('El modal de usuarios ha sido cerrado');
      // Aquí puedes colocar cualquier lógica que desees ejecutar después de cerrar el modal
    });
  }

  resetCampos() {
    this.idempleado = '';
    this.nombre = '';
    this.apellidos = '';
    this.telefono = '';
    this.nit = '';
    this.cui = '';
    this.email = '';
    this.imageUrl = null;
    this.selectedFile = null;
    // Habilitar el botón de agregar
    this.addingEmployee = false;
    this.updatingEmployee = false;
    this.editingMode = false;
  }

  borrarImagen() {
    this.imageUrl = null;
  }
}
