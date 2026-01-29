import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpBackend, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable, BehaviorSubject, catchError, throwError } from 'rxjs';
import { User, TokenResponse, UserDataPayload, RefreshResponse, ApiResponse, NextOfKin, UserAddress } from '../interfaces/user';
import { environment } from '../environment/env_file';


@Injectable({
    providedIn: 'root'
})
export class Auth {

    private API_BASE_URL = environment.apiUrl;

    private standardHttp = inject(HttpClient);
    private router = inject(Router);
    private handler = inject(HttpBackend);

    private interceptorFreeHttp: HttpClient;

    private baseUrl = `${this.API_BASE_URL}auth`;

    private profileUrl = `${this.baseUrl}/profiles`;

    private readonly ACCESS_TOKEN_KEY = 'access_token_app';
    private readonly REFRESH_TOKEN_KEY = 'refresh_token_persistent';
    private readonly USER_DATA_KEY = 'user_data_app';

    private accessToken: string | null = null;
    private refreshToken: string | null = null;
    private rawUserData: string | null = null;

    private isRefreshing = new BehaviorSubject<boolean>(false);
    isRefreshing$ = this.isRefreshing.asObservable();

    isAuthenticated = signal<boolean>(false);

    constructor() {
        this.interceptorFreeHttp = new HttpClient(this.handler);
        this.loadPersistentTokens();
    }


    getAccessToken(): string | null {

        return this.accessToken || localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }

    getRefreshToken(): string | null {
        return this.refreshToken || localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    private loadPersistentTokens(): void {
        const persistentAccess = localStorage.getItem(this.ACCESS_TOKEN_KEY);
        const persistentRefresh = localStorage.getItem(this.REFRESH_TOKEN_KEY);
        const persistentUserData = localStorage.getItem(this.USER_DATA_KEY);

        if (persistentAccess && persistentUserData) {
            this.accessToken = persistentAccess;
            this.rawUserData = persistentUserData;
            this.isAuthenticated.set(true);
            console.log('Session data restored from Local Storage.');
        }

        if (persistentRefresh) {
            this.refreshToken = persistentRefresh;

            this.refreshAccessToken().subscribe({
                next: () => console.log('Session access token refreshed successfully.'),
                error: () => this.logout(false)
            });
        }
    }

    setTokens(access: string | null, refresh: string | null, rawUserData?: string | null): void {
        this.accessToken = access;
        this.refreshToken = refresh;

        if (access) {
            localStorage.setItem(this.ACCESS_TOKEN_KEY, access);
        } else {
            localStorage.removeItem(this.ACCESS_TOKEN_KEY);
        }

        if (refresh) {
            localStorage.setItem(this.REFRESH_TOKEN_KEY, refresh);
        } else {
            localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        }

        if (rawUserData) {
            this.rawUserData = rawUserData;
            localStorage.setItem(this.USER_DATA_KEY, rawUserData);
        } else if (rawUserData === null) {
            this.rawUserData = null;
            localStorage.removeItem(this.USER_DATA_KEY);
        }

        this.isAuthenticated.set(!!access);
    }


    getUserData(): UserDataPayload | null {
        if (!this.rawUserData) {
            return null;
        }

        try {
            const jsonString = atob(this.rawUserData);
            return JSON.parse(jsonString) as UserDataPayload;
        } catch (e) {
            console.error('Error decoding or parsing user data:', e);
            return null;
        }
    }


    userInGroup(groupName: string): boolean {
        const userData = this.getUserData();
        const groups: string[] = userData?.user?.groups || [];

        return groups.includes(groupName);
    }

    getAuthenticatedUser(): User | null {
        const userData = this.getUserData();
        return userData?.user || null;
    }

    login(credentials: any): Observable<TokenResponse> {
        return this.standardHttp.post<TokenResponse>(`${this.baseUrl}/login/`, credentials).pipe(
            tap(response => {
                this.setTokens(response.access, response.refresh, response.user_data);
            })
        );
    }

    getOtpDeliveryMethod(): { method: 'email' | 'sms', destination: string } {
        const data = this.getUserData();
        const user = data?.user;

        if (user?.email && user?.phone_number) {
            return { method: 'email', destination: user.email };
        }
        return { method: 'sms', destination: user?.phone_number || 'your phone' };
    }

    refreshAccessToken(): Observable<RefreshResponse> {
        this.isRefreshing.next(true);
        const refresh = this.getRefreshToken();

        if (!refresh) {
            this.isRefreshing.next(false);
            this.logout(true);
            return throwError(() => new Error('No refresh token available.'));
        }

        const payload = { refresh: refresh };

        return this.interceptorFreeHttp.post<RefreshResponse>(`${this.baseUrl}/token/refresh/`, payload).pipe(
            tap(response => {
                const newRefresh = response.refresh || refresh;

                this.setTokens(response.access, newRefresh, this.rawUserData || undefined);
            }),
            catchError(err => {
                this.logout(true);
                return throwError(() => err);
            }),
            tap(() => this.isRefreshing.next(false))
        );
    }


    logout(redirect: boolean = true): void {

        const refreshToken = this.getRefreshToken();
        const logoutUrl = `${this.baseUrl}/logout/`;

        if (refreshToken) {

            this.interceptorFreeHttp.post(logoutUrl, { refresh: refreshToken })
                .subscribe({
                    next: () => console.log('Backend: Token blacklisted successfully.'),
                    error: (err) => console.error('Backend: Logout request failed.', err)
                });
        }

        this.setTokens(null, null, null);

        this.rawUserData = null;

        if (redirect) {
            this.router.navigate(['/']);
        }

        console.log('User logged out. Session cleared.');
    }

    requestForgotPasswordLink(email: string): Observable<any> {
      return this.standardHttp.post(`${this.baseUrl}/request-forgot-link/`, { email });
    }

    confirmForgotPasswordReset(payload: any): Observable<any> {
        return this.interceptorFreeHttp.post(`${this.baseUrl}/confirm-forgot-password/`, payload);
    }

    getUserProfile(): Observable<User> {
      return this.standardHttp.get<User>(`${this.profileUrl}/`);
    }

    deleteAccount(): Observable<ApiResponse> {
      return this.standardHttp.delete<ApiResponse>(`${this.profileUrl}/`);
    }

    updatePersonalDetails(data: Partial<User>): Observable<ApiResponse> {
      return this.standardHttp.patch<ApiResponse>(`${this.profileUrl}/personal_details/`, data);
    }

    updateNextOfKin(id: number, data: Partial<NextOfKin>): Observable<ApiResponse> {
      const params = new HttpParams().set('id', id.toString());
      return this.standardHttp.put<ApiResponse>(`${this.profileUrl}/next_of_kin/`, data, { params });
    }

    deleteNextOfKin(id: number): Observable<ApiResponse> {
      const params = new HttpParams().set('id', id.toString());
      return this.standardHttp.delete<ApiResponse>(`${this.profileUrl}/next_of_kin/`, { params });
    }

    getProfilePicture(): Observable<any> {
      return this.standardHttp.get<any>(`${this.profileUrl}/`);
    }

    uploadProfilePicture(file: File): Observable<ApiResponse> {
      const formData = new FormData();
      formData.append('image', file);
      return this.standardHttp.patch<ApiResponse>(`${this.profileUrl}/upload_picture/`, formData);
    }


}
