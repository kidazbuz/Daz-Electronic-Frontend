import { Component, ChangeDetectionStrategy, signal, WritableSignal, inject, OnInit, OnDestroy, effect } from '@angular/core';
import { FormGroup, Validators, NonNullableFormBuilder, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Auth } from '../../shared/services/auth';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { ChipModule } from 'primeng/chip';

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, ChipModule, CommonModule, ReactiveFormsModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule],
    template: `
    <div class="text-center mb-4 mt-8 py-5">

        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Welcome to Daz Electronics!</div>
        <span class="text-muted-color font-medium">Sign in to continue</span>
    </div>

    <div>
    <div *ngIf="isLockedOut()" class="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl border border-red-200 text-center">
        <i class="pi pi-lock mr-2 text-xl"></i>
        <div class="font-bold">Security Lock Active</div>
        <div class="text-sm">Too many failed attempts. Please wait <b>{{ lockoutTimer() }}s</b></div>
    </div>

    <div *ngIf="message()" class="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl border border-red-200 text-center">
        <div class="text-sm"><i class="pi pi-exclamation-circle mr-1"></i> {{ message() }}</div>
    </div>

    <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
        <div class="mb-6">
            <label for="phoneInput" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
            <input
                pInputText
                id="phoneInput"
                type="email"
                class="w-full h-12 rounded-xl"
                formControlName="email"
                placeholder="Enter Email Address *"
                [fluid]="true"
                [ngClass]="{'ng-invalid ng-dirty': loginForm.get('email')?.invalid && loginForm.get('email')?.touched}"
            />

                <span class="text-red-500 text-sm block mt-1" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
                    <ng-container *ngIf="loginForm.get('email')?.hasError('required')">Email is required.</ng-container>
                    <ng-container *ngIf="loginForm.get('email')?.hasError('email')">Please enter a valid email address.</ng-container>
                    <ng-container *ngIf="loginForm.get('email')?.hasError('server')">{{ loginForm.get('email')?.getError('server') }}</ng-container>
                </span>
        </div>

        <div class="mb-4">
            <label for="passwordInput" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
            <p-password
                id="passwordInput"
                formControlName="password"
                placeholder="Password"
                [toggleMask]="true"
                inputStyleClass="w-full h-12 rounded-xl"
                [fluid]="true"
                [feedback]="false"
                [ngClass]="{'ng-invalid ng-dirty': loginForm.get('password')?.invalid && loginForm.get('password')?.touched}">
            </p-password>
            <span class="text-red-500 text-sm block mt-1" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">

                Password is required.
            </span>
        </div>

        <div class="flex items-center justify-between mt-2 mb-8 gap-8">
            <div class="flex items-center">
                <p-checkbox id="rememberme1" binary class="mr-2"></p-checkbox>
                <label for="rememberme1">Remember me</label>
            </div>
            <span (click)="onForgotPassword()" class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Forgot password?</span>
        </div>

        <p-button
            type="submit"
            [label]="isLockedOut() ? 'Locked' : (isLoading() ? 'Validating...' : 'Sign In')"
            [icon]="isLoading() ? 'pi pi-spin pi-spinner' : ''"
            styleClass="w-full rounded-pill py-3"
            [disabled]="loginForm.invalid || isLoading() || isLockedOut()">
        </p-button>

        <div *ngIf="!isLockedOut()">
          <div class="relative flex items-center mt-2 py-5">
              <div class="flex-grow border-t border-surface-200 dark:border-surface-700"></div>
              <span class="flex-shrink mx-4 text-surface-500 dark:text-surface-400 font-medium">Or Sign in With</span>
              <div class="flex-grow border-t border-surface-200 dark:border-surface-700"></div>
          </div>

          <div class="flex items-center justify-center flex-wrap gap-2">
              <p-chip label="Apple" icon="pi pi-apple" styleClass="cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800"></p-chip>
              <p-chip label="Facebook" icon="pi pi-facebook" styleClass="cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800"></p-chip>
              <p-chip label="Google" icon="pi pi-google" styleClass="cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800"></p-chip>
          </div>

          <div class="mt-8 pt-4 border-t border-surface-200 dark:border-surface-700 text-center">
              <p class="mb-0">
                  Don't have an account?
                  <a [routerLink]="'/account/register'" class="text-primary font-medium no-underline hover:underline">Sign up now</a>
              </p>
          </div>
        </div>
    </form>
    </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login implements OnInit, OnDestroy {
    private formBuilder = inject(NonNullableFormBuilder);
    private router = inject(Router);
    private authService = inject(Auth);

    // State Signals
    message: WritableSignal<string | null> = signal(null);
    isLoading: WritableSignal<boolean> = signal(false);

    // Security Signals
    failedAttempts = signal<number>(0);
    isLockedOut = signal<boolean>(false);
    lockoutTimer = signal<number>(180); // 3 minutes
    private timerInterval: any;

    constructor(){
      effect(() => {
            if (this.isLockedOut()) {
                this.loginForm.disable(); // Angular handles the DOM for you
            } else {
                this.loginForm.enable();
            }
        });
    }

    loginForm: FormGroup<LoginForm> = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    ngOnInit(): void {}

    ngOnDestroy(): void {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    private startLockoutTimer() {
        this.isLockedOut.set(true);
        this.lockoutTimer.set(180);
        this.loginForm.disable();

        this.timerInterval = setInterval(() => {
            this.lockoutTimer.update(v => v - 1);
            if (this.lockoutTimer() <= 0) {
                this.stopLockout();
            }
        }, 1000);
    }

    private stopLockout() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.isLockedOut.set(false);
        this.failedAttempts.set(0);
        this.loginForm.enable();
        this.message.set(null);
    }

    onLogin(): void {
        if (this.loginForm.invalid || this.isLockedOut()) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.message.set(null);
        this.isLoading.set(true);

        const credentials = this.loginForm.getRawValue();

        this.authService.login(credentials)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: () => {
                    this.failedAttempts.set(0);
                    const delivery = this.authService.getOtpDeliveryMethod();
                    this.router.navigate(['/account/otp-verification'], {
                        state: {
                            email: credentials.email,
                            password: credentials.password,
                            deliveryMethod: delivery.method,
                            destination: delivery.destination
                        }
                    });
                },
                error: (err: HttpErrorResponse) => {
                    this.handleLoginError(err);
                }
            });
    }

    private handleLoginError(err: HttpErrorResponse): void {
        this.failedAttempts.update(v => v + 1);
        const errors = err?.error;

        // Trigger lockout on 3rd failure
        if (this.failedAttempts() >= 3) {
            this.startLockoutTimer();
            return;
        }

        if (err.status === 400 && errors) {
            for (const fieldName in errors) {
                const formControl = this.loginForm.get(fieldName);
                if (formControl) {
                    formControl.setErrors({ 'server': errors[fieldName][0] });
                } else if (fieldName === 'non_field_errors' || fieldName === 'detail') {
                    this.message.set(errors[fieldName]);
                }
            }
        } else {
            this.message.set(errors?.detail || 'Invalid email or password.');
        }
    }

    onForgotPassword(): void {
      this.router.navigate(['/account/forgot-password']);
    }
}
