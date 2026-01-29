import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, throwError, Observable } from 'rxjs';
import { catchError, filter, finalize, switchMap, take } from 'rxjs/operators';
import { Auth } from '../services/auth'; // Ensure this path is correct

// State maintained in the file scope to handle concurrent requests
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authenticationInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(Auth);

    // --- 1. Filter Exclusion Paths ---
    const isAuthEndpoint =
        req.url.includes('/token/') ||
        req.url.includes('/login/') ||
        req.url.includes('/verify-otp/') ||
        req.url.includes('/register/');

    if (isAuthEndpoint) {
        return next(req);
    }

    // --- 2. Attach the Current Token ---
    const token = authService.getAccessToken();
    const authReq = addTokenHeader(req, token);

    // --- 3. Process Request and Handle 401s ---
    return next(authReq).pipe(
        catchError((error) => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                return handle401Error(authReq, next, authService);
            }
            return throwError(() => error);
        })
    );
};

/**
 * Helper: Clones the request and adds the Authorization header
 */
function addTokenHeader(request: HttpRequest<any>, token: string | null): HttpRequest<any> {
    if (!token) return request;
    return request.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
    });
}

/**
 * Helper: Manages the token refresh lifecycle
 */
function handle401Error(request: HttpRequest<any>, next: HttpHandlerFn, authService: Auth): Observable<any> {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return authService.refreshAccessToken().pipe(
            switchMap((response) => {
                // refreshAccessToken in your service already updates memory/storage
                const newToken = authService.getAccessToken();
                refreshTokenSubject.next(newToken);
                return next(addTokenHeader(request, newToken));
            }),
            catchError((err) => {
                authService.logout();
                return throwError(() => err);
            }),
            finalize(() => {
                isRefreshing = false;
            })
        );
    } else {
        // Queue subsequent failed requests until the first refresh finishes
        return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap((token) => next(addTokenHeader(request, token)))
        );
    }
}
