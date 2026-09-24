import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Makes HttpClient available for inject(). `withFetch()` has it use the
    // browser's modern `fetch()` API under the hood instead of the older XMLHttpRequest.
    provideHttpClient(withFetch()),
  ],
};
