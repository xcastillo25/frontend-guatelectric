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
import { Overlay } from 'ol';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, MatIconModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  ubicacion: string = '';
  mapeo: any[] = [];
  overlays: Overlay[] = [];

  constructor(private httpClient: HttpClient, private snackBar: MatSnackBar,
    public dialog: MatDialog) { }

  map!: Map;
  view!: View;
  geolocationMarker!: Feature;
  vectorSource!: VectorSource;
  vectorLayer!: VectorLayer<VectorSource>;

  ngOnInit(): void {
    this.mostrarMapeo(); // Cargar los datos de mapeo al inicializar
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.view = new View({
      center: fromLonLat([-90.315514, 15.104939]),
      zoom: 12
    });

    this.vectorSource = new VectorSource(); // Source for markers
    this.vectorLayer = new VectorLayer({ // Vector layer using the source
      source: this.vectorSource,
      style: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          src: '../../assets/marker.png' // Path to marker image
        })
      })
    });

    this.map = new Map({
      target: this.mapContainer.nativeElement,
      layers: [
        new TileLayer({ source: new OSM() }),
        this.vectorLayer
      ],
      view: this.view
    });

    // Initialize the geolocation marker
    this.geolocationMarker = new Feature({
      geometry: new Point(fromLonLat([-90.315514, 15.104939])),
      name: 'My Geo Marker'
    });
    this.vectorSource.addFeature(this.geolocationMarker); // Adding the marker to the source
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

  mostrarMapeo() {
    this.httpClient.get<any>(`${API_BASE_URL}/api/viewmapeo`).subscribe({
      next: (data) => {
        console.log(data); // Verifica el tipo de datos recibidos
        this.mapeo = data.Mapeo;
        this.addMarkersToMap(); // Función para añadir marcadores
      },
      error: (error) => {
        console.error('Error al obtener mapeo:', error);
      }
    });
  }

  private addMarkersToMap() {
    this.vectorSource.clear(); // Limpiar marcadores anteriores
    this.clearOverlays(); // Limpiar overlays existentes

    this.mapeo.forEach(medidor => {
      const coords = medidor.ubicacion.match(/POINT\s*\(([^)]+)\)/)[1].split(' ').map(Number);
      const point = new Point(fromLonLat([coords[0], coords[1]]));

      const marker = new Feature({
        geometry: point,
        name: 'Medidor',
        data: medidor // Almacenar datos del medidor en el marcador si es necesario
      });

      this.vectorSource.addFeature(marker); // Añadir el marcador al vector de fuentes

      // Crear un overlay para cada marcador
      const element = document.createElement('div');
      element.className = 'overlay';
      element.innerHTML = `<strong>${medidor.nombre_completo}</strong><br>NIS: ${medidor.codigo}`;

      const overlay = new Overlay({
        element: element,
        position: fromLonLat([coords[0], coords[1]]),
        positioning: 'bottom-center'
      });

      this.map.addOverlay(overlay);
      this.overlays.push(overlay); // Guardar referencia al overlay
    });
  }

  private clearOverlays() {
    this.overlays.forEach(overlay => this.map.removeOverlay(overlay));
    this.overlays = [];
  }
}
