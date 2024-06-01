import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

@Component({
  selector: 'app-ol-map',
  template: '<div #mapContainer style="width: 100%; height: 500px;"></div>',
  styleUrls: ['./ol-map.component.css']
})
export class OlMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  map!: Map;

  ngOnInit(): void {
    // Lógica de inicialización si es necesaria
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = new Map({
      target: this.mapContainer.nativeElement,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: [-90.3140, 15.1259], // Centro del mapa en coordenadas EPSG:3857
        zoom: 8 // Nivel de zoom inicial
      })
    });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.setTarget(undefined); // Limpiar el objetivo del mapa para evitar fugas de memoria
    }
  }
}
