import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';


export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withFetch()),
              provideRouter(routes),
              provideClientHydration(),
              provideAnimationsAsync(),
              provideAnimationsAsync()]
};

// api.config.ts
// export const API_BASE_URL = 'http://localhost:8020';

export const API_BASE_URL = 'http://44.229.234.217:8020'
