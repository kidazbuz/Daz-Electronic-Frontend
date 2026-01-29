import { Component, signal, WritableSignal, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl, NonNullableFormBuilder, FormsModule } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { finalize } from 'rxjs/operators';
import { environment } from '../../shared/environment/env_file';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { ChipModule } from 'primeng/chip';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';


interface RegisterForm {
  email: FormControl<string>;
  password: FormControl<string>;
}


@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ButtonModule, DividerModule, CheckboxModule, CommonModule, ReactiveFormsModule, ChipModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule],
    template: `
    <div class="text-center mb-4 mt-8 py-5">

        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Welcome to Daz Electronics!</div>
        <span class="text-muted-color font-medium">Create account to continue</span>
    </div>

    <div *ngIf="message()" class="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl border border-red-200 text-center">
        <div class="text-sm"><i class="pi pi-exclamation-circle mr-1"></i> {{ message() }}</div>
    </div>

    <div>
    <form [formGroup]="registerForm" (ngSubmit)="onRegister()">

        <div class="mb-6">
            <label for="phoneInput" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
            <input
                pInputText
                id="emailInput"
                type="email"
                formControlName="email"
                class="w-full h-12 rounded-xl"
                placeholder="Enter Email Address *"
                [fluid]="true"
                [ngClass]="{'ng-invalid ng-dirty': registerForm.get('email')?.invalid && (registerForm.get('email')?.touched || registerForm.get('email')?.errors?.['server'])}" />

            <span class="text-red-500 text-sm block mt-1" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
                <ng-container *ngIf="registerForm.get('email')?.hasError('required')">Email is required. </ng-container>
                <ng-container *ngIf="registerForm.get('email')?.hasError('email')">Please enter a valid email address. </ng-container>

                <ng-container *ngIf="registerForm.get('email')?.hasError('server')">
                  {{ registerForm.get('email')?.getError('server') }}
                </ng-container>
            </span>
            <div class="text-muted-color text-sm mt-2 flex items-center">
                <i class="pi pi-info-circle mr-1" style="font-size: 0.8rem"></i>
                We'll share a verification code.
            </div>
        </div>

        <div class="mb-8">
            <label for="passwordInput" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
            <p-password
                id="passwordInput"
                formControlName="password"
                placeholder="Password"
                [toggleMask]="true"
                [feedback]="true"
                promptLabel="Security Level"
                weakLabel="Too simple"
                mediumLabel="Average"
                strongLabel="Complex"
                styleClass="w-full"
                inputStyleClass="w-full h-12 rounded-xl"
                [fluid]="true"
                [ngClass]="{'ng-invalid ng-dirty': registerForm.get('password')?.invalid && (registerForm.get('password')?.touched || registerForm.get('password')?.hasError('server'))}">

                <ng-template pTemplate="header">
                    <h6 class="mt-0 mb-2 font-semibold">Password Requirements</h6>
                </ng-template>

                <ng-template pTemplate="footer">
                    <p-divider></p-divider>
                    <ul class="pl-2 ml-2 mt-0 line-height-3 list-none">
                        <li class="flex align-items-center mb-2">
                            <i [class]="(registerForm.get('password')?.value?.length || 0) >= 8 ? 'pi pi-check text-green-500' : 'pi pi-circle text-surface-400'" class="mr-2 text-xs"></i>
                            <span [ngClass]="{'text-green-500': (registerForm.get('password')?.value?.length || 0) >= 8}">Minimum 8 characters</span>
                        </li>
                        <li class="flex align-items-center mb-2">
                            <i [class]="hasUppercase(registerForm.get('password')?.value || '') ? 'pi pi-check text-green-500' : 'pi pi-circle text-surface-400'" class="mr-2 text-xs"></i>
                            <span [ngClass]="{'text-green-500': hasUppercase(registerForm.get('password')?.value || '')}">At least one uppercase letter</span>
                        </li>
                        <li class="flex align-items-center mb-2">
                            <i [class]="hasLowercase(registerForm.get('password')?.value || '') ? 'pi pi-check text-green-500' : 'pi pi-circle text-surface-400'" class="mr-2 text-xs"></i>
                            <span [ngClass]="{'text-green-500': hasLowercase(registerForm.get('password')?.value || '')}">At least one lowercase letter</span>
                        </li>
                        <li class="flex align-items-center mb-2">
                            <i [class]="hasNumber(registerForm.get('password')?.value || '') ? 'pi pi-check text-green-500' : 'pi pi-circle text-surface-400'" class="mr-2 text-xs"></i>
                            <span [ngClass]="{'text-green-500': hasNumber(registerForm.get('password')?.value || '')}">At least one number</span>
                        </li>
                        <li class="flex align-items-center mb-2">
                            <i [class]="hasSymbol(registerForm.get('password')?.value || '') ? 'pi pi-check text-green-500' : 'pi pi-circle text-surface-400'" class="mr-2 text-xs"></i>
                            <span [ngClass]="{'text-green-500': hasSymbol(registerForm.get('password')?.value || '')}">At least one special symbol</span>
                        </li>
                    </ul>

                    <div *ngIf="registerForm.get('password')?.hasError('server')" class="mt-2 p-2 bg-red-50 rounded-lg">
                        <small class="text-red-500">{{ registerForm.get('password')?.getError('server') }}</small>
                    </div>
                </ng-template>
            </p-password>

            <small class="text-red-500 block mt-1" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
                Password is required.
            </small>
        </div>

        <p-button
            type="submit"
            [label]="isLoading() ? 'Validating...' : 'Sign Up'"
            [icon]="isLoading() ? 'pi pi-spin pi-spinner' : ''"
            styleClass="w-full rounded-pill"
            [disabled]="registerForm.invalid || isLoading()">
        </p-button>

        <div class="relative flex items-center mt-2 py-5">
            <div class="flex-grow border-t border-surface-200 dark:border-surface-700"></div>
            <span class="flex-shrink mx-4 text-surface-500 dark:text-surface-400 font-medium">Or register With</span>
            <div class="flex-grow border-t border-surface-200 dark:border-surface-700"></div>
        </div>

        <div class="flex items-center justify-center flex-wrap gap-2">
            <p-chip label="Apple" icon="pi pi-apple" styleClass="cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800"></p-chip>
            <p-chip label="Facebook" icon="pi pi-facebook" styleClass="cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800"></p-chip>
            <p-chip label="Google" icon="pi pi-google" styleClass="cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800"></p-chip>

        </div>

        <div class="mt-8 pt-4 border-t border-surface-200 dark:border-surface-700 text-center">
            <p class="mb-0">
                Already have an account?
                <a [routerLink]="'/account/login'" class="text-primary font-medium no-underline hover:underline">Sign in now</a>
            </p>
        </div>
    </form>
    </div>
    `
})
export class Register {

    checked: boolean = false;
    private apiUrl = environment.apiUrl;
    private baseUrl = `${this.apiUrl}auth`;

    http = inject(HttpClient);
    private formBuilder = inject(NonNullableFormBuilder);
    private router = inject(Router);

    message: WritableSignal<string | null> = signal(null);
    isLoading: WritableSignal<boolean> = signal(false);

    registerForm: FormGroup<RegisterForm> = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    hasUppercase(value: string): boolean {
      return /[A-Z]/.test(value);
    }

    hasLowercase(value: string): boolean {
      return /[a-z]/.test(value);
    }

    hasNumber(value: string): boolean {
      return /[0-9]/.test(value);
    }

    hasSymbol(value: string): boolean {
      return /[!@#$%^&*(),.?":{}|<>]/.test(value);
    }

    onRegister(): void {

      this.message.set(null);
      this.isLoading.set(true);

      if (this.registerForm.invalid) {
        this.registerForm.markAllAsTouched();
        this.isLoading.set(false);
        return;
      }

      const formValue = this.registerForm.getRawValue();

      this.http.post(`${this.baseUrl}/register/`, formValue)
        .pipe(
          finalize(() => this.isLoading.set(false))
        )
        .subscribe({
          next: (res: any) => {
            // 1. Success Path
            this.router.navigate(['account/otp-verification'], {
              state: { email: formValue.email } // Pass email to the next page
            });
          },
          error: err => {
            const errors = err?.error;

            if (errors && typeof errors === 'object') {

              Object.keys(errors).forEach(field => {
                const control = this.registerForm.get(field);
                if (control) {

                  control.setErrors({ server: errors[field][0] });
                  control.markAsTouched();
                }
              });

              if (errors.detail || errors.error || errors.email_error) {
                const msg = errors.detail || errors.error || errors.email_error;
                this.message.set(msg);
              }

            } else {

              this.message.set('Network error. Please check your internet and try again.');
            }
          }
        });
        }

}
