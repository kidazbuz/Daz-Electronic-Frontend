import { Component, OnInit, signal, WritableSignal, inject, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Validators, NonNullableFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { Auth } from '../../shared/services/auth';
import { Message } from '../../shared/services/message';
import { environment } from '../../shared/environment/env_file';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { InputOtpModule } from 'primeng/inputotp';


@Component({
    selector: 'app-otp',
    standalone: true,
    imports: [ButtonModule, MessageModule, InputOtpModule, ToastModule, CommonModule, CheckboxModule, ReactiveFormsModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule],
    template: `
        <p-toast></p-toast>

        <div class="text-center mb-4 mt-8 py-5">

            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">
                {{
                    isPasswordReset() ? 'Confirm Password Change' :
                    (password() ? 'Authentication Required' : 'Verify Your Account')
                }}
            </div>

            <p *ngIf="email()" class="text-muted-color font-medium leading-normal">
                We've sent a security code to your email:<br>
                <span class="text-primary font-bold">{{ email() }}</span>
            </p>
        </div>

        <div *ngIf="isLockedOut()" class="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl border border-red-200 text-center">
            <i class="pi pi-lock mr-2 text-xl"></i>
            <div class="font-bold">Security Lock Active</div>
            <div class="text-sm">Too many failed attempts. Please wait <b>{{ lockoutTimer() }}s</b></div>
        </div>

        <div *ngIf="message()" class="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl border border-red-200 text-center">
            <div class="text-sm"><i class="pi pi-exclamation-circle mr-1"></i> {{ message() }}</div>
        </div>

        <div>
          <form [formGroup]="otpForm" (ngSubmit)="onOtpSubmit()">

          <div class="mb-6 text-center flex flex-column align-items-center">
              <p-inputotp
                  formControlName="OTP"
                  [length]="6"
                  [integerOnly]="true"
                  styleClass="gap-3"
                  size="large"
                  [readonly]="isLockedOut()"/>

              </div>

              <p-button
                  type="submit"
                  [label]="isLockedOut() ? 'Locked' : (isLoading() ? 'Verifying...' : 'Verify Now')"
                  [icon]="isLoading() ? 'pi pi-spin pi-spinner' : 'pi pi-shield'"
                  styleClass="w-full rounded-pill py-3 text-xl"
                  [disabled]="otpForm.invalid || isLoading() || isLockedOut()">
              </p-button>

              <div *ngIf="!isLockedOut()">
                <div class="mt-6 text-center">
                    <p class="text-muted-color mb-4">
                        Didn't receive a code?
                        <button
                            type="button"
                            (click)="onRequestOtp()"
                            [disabled]="isResending() || isLockedOut()"
                            class="text-primary font-bold no-underline border-none bg-transparent cursor-pointer hover:underline p-0 ml-1">
                            {{ isResending() ? 'Sending...' : 'Resend Code' }}
                        </button>
                    </p>

                    <div *ngIf="!isLockedOut()" class="pt-5 border-t border-surface-200 dark:border-surface-700">
                        <a [routerLink]="'/account/login'" class="text-primary font-medium no-underline hover:underline">
                            <i class="pi pi-arrow-left mr-2"></i>Back to Sign in
                        </a>
                    </div>
                </div>
              </div>
          </form>
        </div>

    `
})
export class Otp implements OnInit, OnDestroy {

    private apiUrl = environment.apiUrl;
    private baseUrl = `${this.apiUrl}auth`;

    private router = inject(Router);
    private http = inject(HttpClient);
    private fb = inject(NonNullableFormBuilder);
    private authService = inject(Auth);
    public notify = inject(Message);
    message: WritableSignal<string | null> = signal(null);
    newPassword: WritableSignal<string | null> = signal(null);

    deliveryMethod: WritableSignal<'email' | 'sms' | null> = signal(null);
    email: WritableSignal<string | null> = signal(null);
    password: WritableSignal<string | null> = signal(null);
    isPasswordReset = signal<boolean>(false);

    failedAttempts = signal<number>(0);
    isLockedOut = signal<boolean>(false);
    lockoutTimer = signal<number>(180);
    private timerInterval: any;

    isLoading: WritableSignal<boolean> = signal(false);
    isResending: WritableSignal<boolean> = signal(false);

    otpForm = this.fb.group({
        OTP: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });

    ngOnInit(): void {
        this.getAuthDataFromRouterState();
    }

    ngOnDestroy(): void {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    getAuthDataFromRouterState(): void {
        const state = this.router.lastSuccessfulNavigation?.extras.state;

        if (state && state['email']) {
            this.email.set(state['email']);
            this.password.set(state['password'] || null);
            this.deliveryMethod.set(state['deliveryMethod'] || 'email');
            this.isPasswordReset.set(state['flow'] === 'password_reset');

            if (state['flow'] === 'password_reset') {
                this.newPassword.set(state['new_password'] || null);
            }

        } else {
            this.clearState();
            this.notify.warn('Session expired. Please sign in.', 'Access Denied');
            this.router.navigate(['/account/login']);
        }
    }

    private startLockoutTimer() {
        this.isLockedOut.set(true);
        this.message.set(null);
        this.lockoutTimer.set(180);
        this.otpForm.disable();
        this.timerInterval = setInterval(() => {
            this.lockoutTimer.update(val => val - 1);
            if (this.lockoutTimer() <= 0) this.stopLockout();
        }, 1000);
    }

    private stopLockout() {
        clearInterval(this.timerInterval);
        this.isLockedOut.set(false);
        this.message.set(null);
        this.failedAttempts.set(0);
        this.otpForm.enable();
    }

    private clearState(): void {
        this.email.set(null);
        this.password.set(null);
        this.message.set(null);
        this.isPasswordReset.set(false);
        this.otpForm.reset();
        window.history.replaceState({}, '');
    }

    onOtpSubmit(): void {
        if (this.otpForm.invalid || !this.email() || this.isLockedOut()) return;

        this.isLoading.set(true);
        const state = this.router.lastSuccessfulNavigation?.extras.state;

        let endpoint = `${this.baseUrl}/confirm-registration/`;
        if (this.isPasswordReset()) {
            endpoint = `${this.baseUrl}/password-reset/confirm/`;
        } else if (this.password()) {
            endpoint = `${this.baseUrl}/login/verify-otp/`;
        }

        const payload = {
            email: this.email(),
            OTP: this.otpForm.getRawValue().OTP,
            ...(this.isPasswordReset() && { new_password: this.newPassword() })
        };

        this.http.post(endpoint, payload)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (res: any) => {
                    const isLoginFlow = !!this.password();
                    const emailSnapshot = this.email();
                    this.clearState();

                    if (isLoginFlow && res?.access) {
                        this.authService.setTokens(res.access, res.refresh, res.user_data);
                        this.handleUserRedirection(emailSnapshot);
                    } else {
                        this.notify.success('Success! Redirecting to login...', 'Verified');
                        setTimeout(() => this.router.navigate(['/account/login']), 2000);
                    }
                },
                error: (err) => {
                    if (err.status === 429) {
                        this.startLockoutTimer();
                        this.notify.error('Limit reached. Wait 3 minutes.', 'Security Block');
                    } else {
                        this.failedAttempts.update(val => val + 1);
                        this.otpForm.get('OTP')?.reset();
                        if (this.failedAttempts() >= 3) this.startLockoutTimer();
                        // this.notify.error(`Invalid code. ${3 - this.failedAttempts()} attempts left.`, 'Error');
                        // this.notify.error(`Invalid or expired OTP.`, 'Error');
                        this.message.set('Invalid or expired OTP code.');
                    }
                }
            });
    }

    onRequestOtp(): void {
        if (!this.email() || this.isLockedOut()) return;
        this.isResending.set(true);

        const endpoint = this.isPasswordReset()
            ? `${this.baseUrl}/request/password-reset-otp/`
            : (this.password() ? `${this.baseUrl}/request/login-otp/` : `${this.baseUrl}/request/registration-otp/`);

        this.http.post(endpoint, { email: this.email() })
            .pipe(finalize(() => this.isResending.set(false)))
            .subscribe({
                next: () => {
                  this.notify.success('Code sent successfully.', 'Resent')
                  this.otpForm.reset();
                  this.message.set(null);
                },
                error: () => this.notify.error('Failed to resend. Please try again.', 'Error')
            });
    }

    private handleUserRedirection(backupEmail: string | null): void {
        const user = this.authService.getAuthenticatedUser();
        if (!user) { this.router.navigate(['/account/login']); return; }

        const isCustomer = this.authService.userInGroup('Customer');
        let targetRoute = '/dashboard/main';

        if (!isCustomer) {
            if (user.is_default_password && (!!user.birth_date && !!user.title)) targetRoute = '/account/profile/change-password';
            else if (!user.birth_date || !user.title || !user.is_profile_complete) targetRoute = '/account/profile/complete-registration';
            else if (user.is_default_password) targetRoute = '/account/profile/change-password';
        }
        this.router.navigate([targetRoute]);
    }
}
