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
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, MatIconModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent {
  idcliente: string = '';
  nit: string = '';
  nombre: string = '';
  apellidos: string = '';
  correo: string = '';
  direccion: string = '';
  idtelefono: string = '';
  observaciones: string = '';
  idtipocliente: string = '';

  addingClient: boolean = false;
  updatingClient: boolean = false;
  clientes: any[] = [];
  telefonos: any[] = [];
  telefonoSeleccionado: any;
  tipoclientes: any[] = [];
  tipoclienteSeleccionado: any;

  editingMode: boolean = false;

  selectedItem: string = 'nombre';
  searchTerm: string = '';

  idTelefonoSeleccionado: number = 0;
  idTipoClienteSeleccionado: number = 0;

  limpiarBusqueda(): void {
    this.searchTerm = ''; // Borra el contenido del término de búsqueda
  }

  buscarPorPropiedad(cliente: any): boolean {
    // Verificamos si el término de búsqueda está presente en la propiedad seleccionada
    return cliente[this.selectedItem].toLowerCase().includes(this.searchTerm.toLowerCase());
  }

  constructor(private httpClient: HttpClient, private snackBar: MatSnackBar,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.mostrarClientes();
    this.mostrarTelefonos();
    this.mostrarTipoClientes();
  }

  mostrarClientes() {
    this.httpClient.get<any>(`${API_BASE_URL}/api/clientes`).subscribe(
      (data) => {
        console.log(data); // Verifica el tipo de datos recibidos
        this.clientes = data.Clientes; // Guarda los empleados en una variable local
      },
      (error) => {
        //console.error('Error al obtener empleados:', error);
      }
    );
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

  agregarCliente() {
    if (!this.nit || !this.nombre || !this.apellidos || !this.correo || !this.direccion ||!this.observaciones) {
        this.mostrarSnackBar('Por favor complete todos los campos');
        return;
    }

    if (!this.idTelefonoSeleccionado) {
      this.mostrarSnackBar('Por favor seleccione un teléfono');
      return;
    }

    if (!this.idTipoClienteSeleccionado) {
      this.mostrarSnackBar('Por favor seleccione un tipo de cliente');
      return;
    }
    // Deshabilitar el botón de agregar y mostrar "Agregando..."
    this.addingClient = true;

    this.httpClient.post<any>(`${API_BASE_URL}/api/clientes`, {
        nit: this.nit,
        nombre: this.nombre,
        apellidos: this.apellidos,
        correo: this.correo,
        direccion: this.direccion,
        idtelefono: this.idTelefonoSeleccionado,
        observaciones: this.observaciones,
        idtipocliente: this.idTipoClienteSeleccionado
    }).subscribe(
        (response) => {
            this.mostrarSnackBar('Cliente agregado exitosamente');
            this.mostrarClientes();
            this.resetCampos();
        },
        (error) => {
            console.error('Error al agregar el cliente:', error);
            let errorMessage = 'Hubo un error al agregar el cliente. Por favor, inténtelo de nuevo más tarde';
            if (error.error && error.error.message) {
                errorMessage = error.error.message; // Obtener el mensaje de error del backend
            }
            this.mostrarSnackBar(errorMessage);
            this.addingClient = false; // Habilitar el botón nuevamente
        }
    );
  }

  actualizarCliente() {
    if (!this.idcliente || !this.nombre || !this.apellidos || !this.correo || !this.direccion ||!this.observaciones) {
      this.mostrarSnackBar('Por favor complete todos los campos');
      return;
    }

    if (!this.idTelefonoSeleccionado) {
      this.mostrarSnackBar('Por favor seleccione un teléfono');
      return;
    }

    if (!this.idTipoClienteSeleccionado) {
      this.mostrarSnackBar('Por favor seleccione un tipo de cliente');
      return;
    }

    // Deshabilitar el botón de actualizar y mostrar "Actualizando..."
    this.updatingClient = true;

    this.httpClient.put<any>(`${API_BASE_URL}/api/clientes/${this.idcliente}`, {
      nit: this.nit,
      nombre: this.nombre,
      apellidos: this.apellidos,
      correo: this.correo,
      direccion: this.direccion,
      idtelefono: this.idTelefonoSeleccionado,
      observaciones: this.observaciones,
      idtipocliente: this.idTipoClienteSeleccionado
    }).subscribe(
        (response) => {
            this.mostrarSnackBar('Cliente actualizado exitosamente');
            this.mostrarClientes();
            this.resetCampos();
        },
        (error) => {
            console.error('Error al actualizar el cliente:', error);
            let errorMessage = 'Hubo un error al actualizar el cliente. Por favor, inténtelo de nuevo más tarde';
            if (error.error && error.error.message) {
                errorMessage = error.error.message; // Obtener el mensaje de error del backend
            }
            this.mostrarSnackBar(errorMessage);
            this.updatingClient = false; // Habilitar el botón nuevamente
        }
    );

  }

  eliminarCliente(idCliente: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: '¿Está seguro que desea eliminar definitivamente este cliente?'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.httpClient.delete<any>(`${API_BASE_URL}/api/clientes/${idCliente}`).subscribe(
          (response) => {
            this.mostrarSnackBar('Cliente eliminado exitosamente');
            this.mostrarClientes();
          },
          (error) => {
            console.error('Error al eliminar el cliente:', error);
            let errorMessage = 'Hubo un error al eliminar el cliente. Por favor, inténtelo de nuevo más tarde';
            if (error.error && error.error.message) {
              errorMessage = error.error.message; // Obtener el mensaje de error del backend
            }
            this.mostrarSnackBar(errorMessage);
          }
        );
      }
    });
  }

  cargarClienteSeleccionado(cliente: any) {
    // Cargar los datos del empleado seleccionado en el formulario
    this.nit = cliente.nit;
    this.nombre = cliente.nombre;
    this.apellidos = cliente.apellidos;
    this.correo = cliente.direccion;
    this.direccion = cliente.direccion;
    this.idTelefonoSeleccionado = cliente.idtelefono;
    this.observaciones = cliente.observaciones;
    this.idTipoClienteSeleccionado = cliente.idtipocliente;
    this.idcliente = cliente.idcliente;
    this.editingMode = true;
    console.log("Data", cliente);
  }

  cambiarEstadoCliente(idcliente: string) {
    this.httpClient.put<any>(`${API_BASE_URL}/api/estado-clientes/${idcliente}`, {}).subscribe(
      (response) => {
        this.mostrarSnackBar('Estado del cliente actualizado exitosamente');
        this.mostrarClientes(); // Actualiza la lista de empleados después de cambiar el estado
      },
      (error) => {
        console.error('Error al cambiar el estado del cliente:', error);
        let errorMessage = 'Hubo un error al cambiar el estado del cliente. Por favor, inténtelo de nuevo más tarde';
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
    this.nit = '';
    this.nombre = '';
    this.apellidos = '';
    this.correo = '';
    this.direccion = '';
    this.observaciones = '';
    this.tipoclienteSeleccionado = 0;
    this.telefonoSeleccionado = 0;
    this.updatingClient = false;
    this.addingClient = false;
    this.editingMode = false;
  }
}
