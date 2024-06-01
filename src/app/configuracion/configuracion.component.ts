import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_BASE_URL } from '../app.config';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  providers: [],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.css'
})
export class ConfiguracionComponent {
  empresa: string = '';
  direccion: string = '';
  nit: string = '';
  telefono: string = '';
  celular: string = '';
  imageUrl: string | null = null;
  selectedFile: File | null = null;
  addingEmployee: boolean = false;

  miempresa: any = {};

  constructor(private httpClient: HttpClient, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.mostrarEmpresas();
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

  borrarImagen() {
    this.imageUrl = null;
  }

}
