import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';

import { EmpleadoComponent } from '../empleado/empleado.component';
import { ConfiguracionComponent } from '../configuracion/configuracion.component';
import { RolesComponent } from '../roles/roles.component';
import { InicioComponent } from '../inicio/inicio.component';
import { TipoClienteComponent } from '../tipo-cliente/tipo-cliente.component';
import { TelefonosComponent } from '../telefonos/telefonos.component';
import { ClientesComponent } from '../clientes/clientes.component';
import { TipoMedidorComponent } from '../tipo-medidor/tipo-medidor.component';
import { MedidorComponent } from '../medidor/medidor.component';
import { LecturaComponent } from '../lectura/lectura.component';
import { FacturasComponent } from '../facturas/facturas.component';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [MatIconModule, MatFormFieldModule, MatDatepickerModule,
            MatNativeDateModule, FormsModule, MatInputModule, CommonModule,
            EmpleadoComponent, ConfiguracionComponent, RolesComponent,
            InicioComponent, TipoClienteComponent, ClientesComponent,
            TipoMedidorComponent, MedidorComponent, LecturaComponent,
            FacturasComponent],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css',
  providers: []
})
export class DashboardAdminComponent implements OnInit {

  userData: any;
  datosUsuario: any;
  sidebarVisible = true;

  empleadoComponent = EmpleadoComponent;
  configuracionComponent = ConfiguracionComponent;
  rolesComponent = RolesComponent;
  inicioComponent = InicioComponent;
  tipoclienteComponent = TipoClienteComponent;
  telefonoComponent = TelefonosComponent;
  clientesComponent = ClientesComponent;
  tipomedidorComponent = TipoMedidorComponent;
  medidorComponent = MedidorComponent;
  lecturaComponent = LecturaComponent;
  facturasComponent = FacturasComponent;
  activeComponent: any = null;

  onContainerClicked(event: MouseEvent): void {
    // Verificar si el clic fue fuera del sidebar
    const clickedElement = event.target as HTMLElement;
    const sidebarElement = document.querySelector('.asidebar');
    if (sidebarElement && !sidebarElement.contains(clickedElement)) {
      this.sidebarVisible = false;
    }
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  //Dashboard que se muestra al principio
  constructor(private httpClient: HttpClient, private router: Router, private authService: AuthService) {
    this.activeComponent = this.inicioComponent;
  }

  logout(): void {
    this.authService.logout();
    // Redirigir al componente de inicio de sesión al cerrar sesión
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras.state) {
      this.userData = navigation.extras.state['userData']; // Accede a userData con corchetes
    };
    this.datosUsuario = this.authService.obtenerDatosUsuario();
  }

  setActiveComponent(component: any): void {
    this.activeComponent = component;
  }

  mostrarEmpleado: boolean = false;

  // Método para mostrar u ocultar el componente EmpleadoComponent
  toggleMostrarEmpleado(): void {
    this.mostrarEmpleado = !this.mostrarEmpleado;
  }

  selectedIcon: string = 'dashboard';
  selectedText: string = 'Inicio';
  activeButton: string = '';
  fechaSeleccionada: Date = new Date();

  toggleActive(buttonName: string, icon: string, text: string): void {
    if (this.isActive(buttonName)) {
      this.activeButton = ''; // Si el botón ya está activo, lo desactivamos
    } else {
      this.activeButton = buttonName; // Si no, lo activamos
      this.selectedIcon = icon; // Actualizamos el icono seleccionado
      this.selectedText = text; // Actualizamos el texto seleccionado

      // Desactivar todos los demás componentes
      for (let i = 1; i <= 6; i++) {
        if (i.toString() !== buttonName) {
          document.getElementById('button' + i)?.classList.remove('active');
        }
      }

      // Activar el componente correspondiente
      document.getElementById(buttonName)?.classList.add('active');

      // Actualizar el componente activo
      switch (buttonName) {
        case 'button1':
          // Acción para el botón de Inicio
          // Puedes añadir aquí lógica específica si es necesaria
          break;
        case 'button2':
          // Acción para el botón de Empleados
          break;
        case 'button3':
          // Acción para el botón de Categorías
          // Puedes añadir aquí lógica específica si es necesaria
          break;
        case 'button4':
          // Acción para el botón de Servicios
          // Puedes añadir aquí lógica específica si es necesaria
          break;
        case 'button5':
          // Acción para el botón de Usuarios
          // Puedes añadir aquí lógica específica si es necesaria
          break;
        case 'button6':
          // Acción para el botón de Configuración
          break;
        default:
          // Acción por defecto si no se encuentra el botón
          break;
      }
    }
  }

  isActive(buttonName: string): boolean {
      return this.activeButton === buttonName;
  }

  seleccionarFecha(event: any): void {
    // Lógica para manejar la fecha seleccionada si es necesario
  }
}
