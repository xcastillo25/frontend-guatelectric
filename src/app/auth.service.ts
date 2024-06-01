import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { API_BASE_URL } from './app.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${API_BASE_URL}/api/login`;

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { usuario: username, password: password })
      .pipe(
        tap(response => {
          const token = response.token;
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('token', token);
          }
        })
      );
  }

  guardarDatosUsuario(datosUsuario: any): void {
    localStorage.setItem('datosUsuario', JSON.stringify(datosUsuario));
  }

  obtenerDatosUsuario(): any {
    const datosUsuarioString = localStorage.getItem('datosUsuario');
    return datosUsuarioString ? JSON.parse(datosUsuarioString) : null;
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
    }
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const isLoggedIn = this.checkAuthentication();

    //borrar typeof localstorage
    if (!isLoggedIn && typeof localStorage !== 'undefined') {
      // Guarda la última ruta visitada
      const currentUrl = this.router.url;
      localStorage.setItem('lastVisitedUrl', currentUrl);

      // Redirige al usuario al inicio de sesión
      this.router.navigate(['/login']);
    }

    return isLoggedIn;
  }

  checkAuthentication(): boolean {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('token');
      return !!token;
    } else {
      // Si localStorage no está definido, asumimos que el usuario no está autenticado
      return false;
    }
  }
}
