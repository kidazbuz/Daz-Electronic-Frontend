import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';

import { Master } from '../../shared/services/master';
import { Auth } from '../../shared/services/auth';


export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('new_password')?.value;
  const confirm = control.get('confirm_password')?.value;
  return password && confirm && password === confirm ? null : { mismatch: true };
};

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ButtonModule, DividerModule, PasswordModule, CommonModule, ReactiveFormsModule, ToastModule],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-full mb-4">
        <i class="pi pi-lock text-3xl text-primary-500"></i>
      </div>
      <h1 class="text-surface-900 dark:text-surface-0 font-bold text-3xl lg:text-5xl mb-2">Secure Your Account</h1>
      <div class="text-surface-600 dark:text-surface-200 mb-8">Set a strong password to protect your data.</div>
    </div>

    <form [formGroup]="passwordForm" class="space-y-6">
      <div class="flex flex-col gap-2">
        <label class="font-semibold text-sm">New Password</label>
        <p-password
            formControlName="new_password"
            [toggleMask]="true"
            [feedback]="true"
            promptLabel="Security Level"
            weakLabel="Too simple"
            mediumLabel="Average"
            strongLabel="Complex"
            styleClass="w-full"
            inputStyleClass="w-full p-3"
            placeholder="Enter new password"
            [ngClass]="{'ng-invalid ng-dirty': passwordForm.get('new_password')?.invalid && passwordForm.get('new_password')?.touched}">

            <ng-template pTemplate="header">
                <h6 class="mt-0 mb-2 font-semibold">Password Requirements</h6>
            </ng-template>
            <ng-template pTemplate="footer">
                <p-divider></p-divider>
                <ul class="pl-2 ml-2 mt-0 line-height-3 list-none">
                    <li class="flex align-items-center mb-2">
                        <i [class]="passwordForm.get('new_password')?.value?.length >= 8 ? 'pi pi-check text-green-500' : 'pi pi-circle text-surface-400'" class="mr-2 text-xs"></i>
                        <span [ngClass]="{'text-green-500': passwordForm.get('new_password')?.value?.length >= 8}">Minimum 8 characters</span>
                    </li>

                    <li class="flex align-items-center mb-2">
                        <i [class]="hasUppercase(passwordForm.get('new_password')?.value) ? 'pi pi-check text-green-500' : 'pi pi-circle text-surface-400'" class="mr-2 text-xs"></i>
                        <span [ngClass]="{'text-green-500': hasUppercase(passwordForm.get('new_password')?.value)}">At least one uppercase letter</span>
                    </li>

                    <li class="flex align-items-center mb-2">
                        <i [class]="hasLowercase(passwordForm.get('new_password')?.value) ? 'pi pi-check text-green-500' : 'pi pi-circle text-surface-400'" class="mr-2 text-xs"></i>
                        <span [ngClass]="{'text-green-500': hasLowercase(passwordForm.get('new_password')?.value)}">At least one lowercase letter</span>
                    </li>

                    <li class="flex align-items-center mb-2">
                        <i [class]="hasNumber(passwordForm.get('new_password')?.value) ? 'pi pi-check text-green-500' : 'pi pi-circle text-surface-400'" class="mr-2 text-xs"></i>
                        <span [ngClass]="{'text-green-500': hasNumber(passwordForm.get('new_password')?.value)}">At least one number</span>
                    </li>

                    <li class="flex align-items-center mb-2">
                        <i [class]="hasSymbol(passwordForm.get('new_password')?.value) ? 'pi pi-check text-green-500' : 'pi pi-circle text-surface-400'" class="mr-2 text-xs"></i>
                        <span [ngClass]="{'text-green-500': hasSymbol(passwordForm.get('new_password')?.value)}">At least one special symbol (!@#$%^&*)</span>
                    </li>
                </ul>
            </ng-template>
        </p-password>
      </div>

      <div class="flex flex-col gap-2 mt-4">
        <label class="font-semibold text-sm">Confirm New Password</label>
        <p-password
            formControlName="confirm_password"
            [toggleMask]="true"
            [feedback]="false"
            styleClass="w-full"
            inputStyleClass="w-full p-3"
            placeholder="Re-enter password"
            [ngClass]="{'ng-invalid ng-dirty': passwordForm.errors?.['mismatch'] && passwordForm.get('confirm_password')?.touched}">
        </p-password>

        <div *ngIf="passwordForm.errors?.['mismatch'] && passwordForm.get('confirm_password')?.touched"
             class="flex items-center gap-2 text-red-500 text-xs mt-1">
            <i class="pi pi-exclamation-triangle"></i>
            <span>Passwords do not match. Please verify.</span>
        </div>
      </div>

      <div class="text-center">
        <p-button [disabled]="loading" (click)="changePassword()">
          <i *ngIf="!loading" class="pi pi-key text-xl text-slate-400 group-hover:text-primary-500"></i>
          <i *ngIf="loading" class="pi pi-spin pi-spinner text-xl text-primary-500"></i>
          <span>
            {{ loading ? 'Sending Code...' : 'Change Password' }}
          </span>
        </p-button>
      </div>

      <button
      type="button"
      (click)="skipPassword()"
      class="w-full text-slate-500 text-sm py-2 no-underline border-none bg-transparent cursor-pointer">

      <div class="pt-4 border-t border-surface-200 dark:border-surface-700 text-center">
        <p class="mb-0 hover:text-primary-600 transition-colors">
          Maybe later, take me to Dashboard
        </p>
      </div>
    </button>

    </form>

  `
})
export class ChangePassword implements OnInit {

  loading = false;
  passwordForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private masterService: Master,
    private messageService: MessageService,
    private router: Router,
    private authService: Auth
  ) {}

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.passwordForm = this.fb.group({
      new_password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)
      ]],
      confirm_password: ['', [Validators.required]]
    }, {

      validators: passwordMatchValidator
    });
  }

  hasNumber(val: string): boolean {
      return /[0-9]/.test(val);
  }

  hasLetter(val: string): boolean {
      return /[a-zA-Z]/.test(val);
  }

  hasUppercase(val: string): boolean {
    return /[A-Z]/.test(val);
  }

  hasLowercase(val: string): boolean {
      return /[a-z]/.test(val);
  }

  hasSymbol(val: string): boolean {
      return /[!@#$%^&*]/.test(val);
  }

  changePassword() {
      this.loading = true;

      const user = this.authService.getAuthenticatedUser();
      const email = user?.email;

      if (!email) {
          this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'User session not found. Please log in again.'
          });
          this.router.navigate(['/account/login']);
          return;
      }

      this.masterService.requestPasswordResetOtp(email).subscribe({
          next: () => {
              this.loading = false;
              this.messageService.add({
                  severity: 'info',
                  summary: 'OTP Sent',
                  detail: 'A verification code has been sent to your email.'
              });

              this.router.navigate(['/account/otp-verification'], {
                  state: {
                      email: email,
                      new_password: this.passwordForm.get('new_password')?.value,
                      flow: 'password_reset'
                  }
              });
          },
          error: (err) => {
              this.loading = false;
              this.messageService.add({
                  severity: 'error',
                  summary: 'Request Failed',
                  detail: err.error?.detail || 'Could not send reset code.'
              });
          }
      });
  }

  skipPassword(){
    this.router.navigate(['/dashboard/main']);
  }

}
