import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { RecoveryModalComponent } from '../recovery-modal/recovery-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatIconModule, MatDialogModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  hidePassword = true;
  username: string = '';
  password: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, public dialog: MatDialog, private snackBar: MatSnackBar,
              private router: Router
  ) {}

  togglePasswordVisibility():void {
    this.hidePassword = !this.hidePassword;
  }

  openRecoveryModal(): void {
    const dialogRef = this.dialog.open(RecoveryModalComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log('Modal cerrado');
    });
  }

  login(): void {
    console.log('Iniciando sesión...');

    if (!this.username || !this.password) {
      console.log('Campos de usuario y contraseña vacíos');
      this.mostrarSnackBar('Por favor complete todos los campos');
      return;
    }

    this.isLoading = true;

    this.authService.login(this.username, this.password).subscribe(
      (response) => {
        console.log('Respuesta del servidor:', response);
        localStorage.setItem('token', response.token);
        console.log('Token almacenado en localStorage');

        // Mostrar notificación de bienvenida
        this.mostrarSnackBar('Bienvenido al sistema');

        // Redirigir al dashboard-admin
        console.log('Redirigiendo al dashboard-admin...');
        this.authService.guardarDatosUsuario(response);
        this.router.navigate(['/dashboard-admin']);
        console.log('Redirección completada.');

        this.isLoading = false;
      },
      (error) => {
        console.error('Error de autenticación:', error);
        this.isLoading = false;
        this.mostrarSnackBar('Credenciales incorrectas');
      }
    );
  }


  mostrarSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
      panelClass: ['my-custom-snackbar'],
      politeness: 'polite'
    });
  }
}
