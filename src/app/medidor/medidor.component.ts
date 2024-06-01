import { Component, OnInit, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_BASE_URL } from '../app.config';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { fromLonLat, toLonLat } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';
import { ZoomSlider, FullScreen, Zoom } from 'ol/control';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Icon, Style } from 'ol/style';
import { Modify, Select } from 'ol/interaction';

@Component({
  selector: 'app-medidor',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, MatIconModule],
  templateUrl: './medidor.component.html',
  styleUrl: './medidor.component.css'
})

export class MedidorComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  idmedidor: string = '';
  serie: string = '';
  codigo: string = '';
  ubicacion: string = '';
  direccion: string = '';

  addingMetric: boolean = false;
  updatingMetric: boolean = false;
  medidores: any[] = [];
  clientes: any[] = [];
  clienteSeleccionado: any;
  tipomedidores: any[] = [];
  tipomedidorSeleccionado: any;

  editingMode: boolean = false;

  selectedItem: string = 'serie';
  searchTerm: string = '';

  idClienteSeleccionado: number = 0;
  idTipoMedidorSeleccionado: number = 0;

  map!: Map;
  view!: View;
  geolocationMarker!: Feature;
  vectorSource!: VectorSource;
  modifyInteraction!: Modify;

  constructor(private httpClient: HttpClient, private snackBar: MatSnackBar,
    public dialog: MatDialog) { }

  ngOnInit(): void {
    this.mostrarMedidores();
    this.mostrarClientes();
    this.mostrarTipoMedidores();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.view = new View({
      center: fromLonLat([-90.315514, 15.104939]), // Centro del mapa en Baja Verapaz, Guatemala
      zoom: 12  // Nivel de zoom inicial
    });

    this.map = new Map({
      target: this.mapContainer.nativeElement,
      layers: [
        new TileLayer({
          source: new OSM()  // Capa base utilizando OpenStreetMap
        })
      ],
      view: this.view,
      controls: [
        new Zoom(),
        new FullScreen(),
        new ZoomSlider()
    ]  // Controles por defecto y agregando pantalla completa
    });
    // Initialize geolocation marker
    this.geolocationMarker = new Feature();
    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [this.geolocationMarker]
      }),
      style: new Style({
        image: new Icon({
          anchor: [0.5, 46],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          src: '../../assets/markerlite.png'
        })
      })
    });
    this.map.addLayer(vectorLayer);

    // Listen for map clicks and move the marker to the clicked location
    this.map.on('singleclick', (event) => {
      const clickedCoords = toLonLat(event.coordinate);
      this.geolocationMarker.setGeometry(new Point(fromLonLat(clickedCoords)));
      this.ubicacion = `POINT(${clickedCoords[0]} ${clickedCoords[1]})`;
  });
  }

  locate(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const coords = [position.coords.longitude, position.coords.latitude];
        const olCoords = fromLonLat(coords);
        this.view.setCenter(olCoords);
        this.view.setZoom(14);

        // Update the geolocation marker
        this.geolocationMarker.setGeometry(new Point(olCoords));

        // Update the input field
        this.ubicacion = `POINT(${position.coords.longitude} ${position.coords.latitude})`;
      }, (error) => {
        console.error('Geolocation error: ', error);
        alert('Error obtaining location.');
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  private updateMarkerLocation(coordinates: [number, number]): void {
    this.geolocationMarker.setGeometry(new Point(fromLonLat(coordinates)));
    this.ubicacion = `POINT(${coordinates[0]} ${coordinates[1]})`;
  }

  increaseZoom(): void {
    const zoom = this.view.getZoom();
    if (zoom !== undefined) {
      this.view.setZoom(zoom + 1);  // Aumenta el nivel de zoom
    }
  }

  decreaseZoom(): void {
    const zoom = this.view.getZoom();
    if (zoom !== undefined) {
      this.view.setZoom(zoom - 1);  // Disminuye el nivel de zoom
    }
  }

  toggleFullScreen(): void {
    const elem = this.map.getTargetElement();  // Obtiene el elemento del mapa
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();  // Solicita el modo pantalla completa
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();  // Sale del modo pantalla completa
      }
    }
  }

  limpiarBusqueda(): void {
    this.searchTerm = ''; // Borra el contenido del término de búsqueda
  }

  buscarPorPropiedad(medidor: any): boolean {
    // Verificamos si el término de búsqueda está presente en la propiedad seleccionada
    return medidor[this.selectedItem].toLowerCase().includes(this.searchTerm.toLowerCase());
  }

  mostrarMedidores() {
    this.httpClient.get<any>(`${API_BASE_URL}/api/medidores`).subscribe(
      (data) => {
        console.log(data); // Verifica el tipo de datos recibidos
        this.medidores = data.Medidores; // Guarda los empleados en una variable local
      },
      (error) => {
        //console.error('Error al obtener empleados:', error);
      }
    );
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

  agregarMedidor() {
    if (!this.serie || !this.codigo || !this.ubicacion || !this.direccion || !this.idClienteSeleccionado || !this.idTipoMedidorSeleccionado) {
        this.mostrarSnackBar('Por favor complete todos los campos y seleccione las opciones necesarias.');
        return;
    }

    this.addingMetric = true;  // Deshabilitar el botón de agregar para evitar duplicados

    console.log('Datos enviados:', {
        serie: this.serie,
        codigo: this.codigo,
        ubicacion: this.ubicacion,
        estado: true,  // Asumiendo que el nuevo medidor está activo
        idtipomedidor: this.idTipoMedidorSeleccionado,
        idcliente: this.idClienteSeleccionado,
        direccion: this.direccion
    });

    this.httpClient.post<any>(`${API_BASE_URL}/api/medidores`, {
        serie: this.serie,
        codigo: this.codigo,
        ubicacion: this.ubicacion,
        estado: true,  // Asumiendo que el nuevo medidor está activo
        idtipomedidor: this.idTipoMedidorSeleccionado,
        idcliente: this.idClienteSeleccionado,
        direccion: this.direccion
    }).subscribe({
        next: (response) => {
            this.mostrarSnackBar('Medidor agregado exitosamente');
            this.mostrarMedidores();
            this.resetCampos();
            this.addingMetric = false;  // Habilitar botón después de la operación
        },
        error: (error) => {
            console.error('Error al agregar el medidor:', error);
            this.mostrarSnackBar('Hubo un error al agregar el medidor. Por favor, inténtelo de nuevo más tarde');
            this.addingMetric = false;  // Habilitar botón después de la operación
        }
    });
  }

  actualizarMedidor() {
    if (!this.serie || !this.codigo || !this.ubicacion || !this.direccion) {
        this.mostrarSnackBar('Por favor complete todos los campos');
        return;
    }

    if (!this.idClienteSeleccionado) {
        this.mostrarSnackBar('Por favor seleccione un cliente');
        return;
    }

    if (!this.idTipoMedidorSeleccionado) {
        this.mostrarSnackBar('Por favor seleccione un tipo de medidor');
        return;
    }

    this.updatingMetric = true;  // Deshabilitar el botón de actualizar para evitar duplicados

    console.log('Actualizando con datos:', {
        serie: this.serie,
        codigo: this.codigo,
        ubicacion: this.ubicacion,
        estado: true,  // Asumiendo que el estado se mantiene activo o es actualizado así
        idtipomedidor: this.idTipoMedidorSeleccionado,
        idcliente: this.idClienteSeleccionado,
        direccion: this.direccion
    });

    this.httpClient.put<any>(`${API_BASE_URL}/api/medidores/${this.idmedidor}`, {
        serie: this.serie,
        codigo: this.codigo,
        ubicacion: this.ubicacion,  // Asegúrate de que esto está en el formato correcto esperado por el servidor
        estado: true,  // Considera permitir actualizar este campo si es necesario
        idtipomedidor: this.idTipoMedidorSeleccionado,
        idcliente: this.idClienteSeleccionado,
        direccion: this.direccion
    }).subscribe({
        next: (response) => {
            this.mostrarSnackBar('Medidor actualizado exitosamente');
            this.mostrarMedidores();  // Recargar la lista de medidores para ver los cambios
            this.resetCampos();  // Limpiar los campos del formulario
            this.updatingMetric = false;  // Habilitar botón después de la operación
        },
        error: (error) => {
            console.error('Error al actualizar el medidor:', error);
            this.mostrarSnackBar('Hubo un error al actualizar el medidor. Por favor, inténtelo de nuevo más tarde');
            this.updatingMetric = false;  // Habilitar botón después de la operación
        }
    });
}


  eliminarMedidor(idMedidor: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: '¿Está seguro que desea eliminar definitivamente este medidor?'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.httpClient.delete<any>(`${API_BASE_URL}/api/medidores/${idMedidor}`).subscribe(
          (response) => {
            this.mostrarSnackBar('Medidor eliminado exitosamente');
            this.mostrarMedidores();
          },
          (error) => {
            console.error('Error al eliminar el medidor:', error);
            let errorMessage = 'Hubo un error al eliminar el medidor. Por favor, inténtelo de nuevo más tarde';
            if (error.error && error.error.message) {
              errorMessage = error.error.message; // Obtener el mensaje de error del backend
            }
            this.mostrarSnackBar(errorMessage);
          }
        );
      }
    });
  }

  cargarMedidorSeleccionado(medidor: any) {
    this.serie = medidor.serie;
    this.codigo = medidor.codigo;
    this.direccion = medidor.direccion;
    this.idClienteSeleccionado = medidor.idcliente;
    this.idTipoMedidorSeleccionado = medidor.idtipomedidor;
    this.editingMode = true;
    this.idmedidor = medidor.idmedidor;

    // Extraer las coordenadas del texto WKT (Well-Known Text) si están presentes
    if (medidor.ubicacion && typeof medidor.ubicacion === 'string') {
        const match = medidor.ubicacion.match(/POINT\s*\(([^)]+)\)/);
        if (match && match[1]) {
            const coords = match[1].split(' ');
            const longitude = parseFloat(coords[0]);
            const latitude = parseFloat(coords[1]);
            this.ubicacion = `POINT(${longitude} ${latitude})`;
            const newCenter = fromLonLat([longitude, latitude]);
            this.view.setCenter(newCenter);
            this.view.setZoom(14);
            this.geolocationMarker.setGeometry(new Point(newCenter));
        } else {
            console.error('Ubicación no definida o formato incorrecto', medidor.ubicacion);
            this.mostrarSnackBar('Ubicación no disponible o en formato incorrecto.');
            this.ubicacion = ''; // Clear the ubicacion field if format is wrong
        }
    } else {
        console.error('Ubicación no definida o formato incorrecto', medidor.ubicacion);
        this.mostrarSnackBar('Ubicación no disponible o en formato incorrecto.');
        this.ubicacion = ''; // Clear the ubicacion field if not provided
    }

    console.log("Data loaded:", medidor);
}


  cambiarEstadoMedidor(idmedidor: string) {
    this.httpClient.put<any>(`${API_BASE_URL}/api/estado-medidores/${idmedidor}`, {}).subscribe(
      (response) => {
        this.mostrarSnackBar('Estado del medidor actualizado exitosamente');
        this.mostrarMedidores(); // Actualiza la lista de empleados después de cambiar el estado
      },
      (error) => {
        console.error('Error al cambiar el estado del medidor:', error);
        let errorMessage = 'Hubo un error al cambiar el estado del medidor. Por favor, inténtelo de nuevo más tarde';
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
    this.serie = '';
    this.codigo = '';
    this.ubicacion = '';
    this.direccion = '';
    this.idClienteSeleccionado = 0;
    this.idTipoMedidorSeleccionado = 0;
    this.updatingMetric = false;
    this.addingMetric = false;
    this.editingMode = false;
  }
}
