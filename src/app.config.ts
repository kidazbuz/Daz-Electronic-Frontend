import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http'; // [1] Import withInterceptors
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import { appRoutes } from './app.routes';
import { authenticationInterceptor } from './app/shared/interceptor/authentication-interceptor'; // [2] Import your interceptor function

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(
            appRoutes,
            withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
            withEnabledBlockingInitialNavigation()
        ),
        provideHttpClient(
            withFetch(),
            withInterceptors([authenticationInterceptor]) // [3] Register the interceptor here
        ),
        MessageService,
        provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: Aura,
                options: { darkModeSelector: '.app-dark' }
            }
        })
    ]
};
