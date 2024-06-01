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
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, MatIconModule],
  templateUrl: './facturas.component.html',
  styleUrl: './facturas.component.css'
})
export class FacturasComponent {
  searchTerm: string = '';
  selectedItem: string = 'fecha';
  facturas: any[] = [];
  no: string = '';
  fecha: string = '';
  consumo: string = '';
  nit: string = '';
  nombre: string = '';
  apellidos: string = '';
  correo: string = '';
  idconsumo: string = '';
  idfactura: string = '';
  enviado: string = '';

  limpiarBusqueda(): void {
    this.searchTerm = ''; // Borra el contenido del término de búsqueda
  }

  buscarPorPropiedad(factura: any): boolean {
    // Verificamos si el término de búsqueda está presente en la propiedad seleccionada
    return factura[this.selectedItem].toLowerCase().includes(this.searchTerm.toLowerCase());
  }

  constructor(private httpClient: HttpClient, private snackBar: MatSnackBar,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.mostrarFacturas();
  }

  mostrarFacturas() {
    this.httpClient.get<any>(`${API_BASE_URL}/api/viewfacturas`).subscribe(
      (data) => {
        console.log(data); // Verifica el tipo de datos recibidos
        this.facturas = data.Facturas; // Guarda los empleados en una variable local
      },
      (error) => {
        //console.error('Error al obtener empleados:', error);
      }
    );
  }

  imprimirFacturas() {
    this.httpClient.get(`${API_BASE_URL}/api/viewfacturas/${this.idfactura}`, { responseType: 'blob' }).subscribe(
      (response) => {
        const fileURL = window.URL.createObjectURL(response);
        window.open(fileURL, '_blank');
      },
      (error) => {
        console.error('Error al imprimir factura:', error);
      }
    );
  }


  cargarFacturaSeleccionada(factura: any) {
    // Cargar los datos del empleado seleccionado en el formulario
    this.no = factura.nofactura;
    this.fecha = factura.fecha;
    this.consumo = factura.consumokw;
    this.nit = factura.nit;
    this.nombre = factura.nombre;
    this.apellidos = factura.apellidos;
    this.correo = factura.apellido;
    this.idconsumo = factura.idconsumo;
    this.idfactura = factura.idfactura;
    this.enviado = factura.enviado;
    console.log("Data", factura);
  }

  enviarFactura() {
    this.httpClient.post(`${API_BASE_URL}/api/viewfacturas/enviar/${this.idfactura}`, {}).subscribe(
      (response: any) => {
        this.mostrarSnackBar('Factura enviada exitosamente');
        this.mostrarFacturas(); // Refrescar la lista de facturas después de enviar
      },
      (error) => {
        this.mostrarSnackBar('No se ha podido mandar la factura');
        console.error('Error al enviar factura:', error);
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
}
