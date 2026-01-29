import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { NonNullableFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../shared/services/auth';
import { finalize } from 'rxjs';
import { DividerModule } from 'primeng/divider';


@Component({
    selector: 'app-confirm-reset',
    standalone: true,
    imports: [ReactiveFormsModule, DividerModule, CommonModule, RouterModule, ButtonModule, PasswordModule, ToastModule],
    providers: [MessageService],
    template: `
    <p-toast />

    <div class="text-center mb-4 mt-8 py-5">
        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">New Password!</div>
        <span class="text-muted-color font-medium">Secure your account with a new password</span>
    </div>

    <div *ngIf="message()" class="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl border border-red-200 text-center">
        <div class="text-sm"><i class="pi pi-exclamation-circle mr-1"></i> {{ message() }}</div>
    </div>

    <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">

        <div class="gap-2 mb-4">
            <label for="phoneInput" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">New Password</label>
            <p-password
                formControlName="new_password"
                [toggleMask]="true"
                [feedback]="true"
                promptLabel="Security Level"
                weakLabel="Too simple"
                mediumLabel="Average"
                strongLabel="Complex"
                styleClass="w-full"
                inputStyleClass="w-full h-12 rounded-xl"
                placeholder="Enter new password"
                [ngClass]="{'ng-invalid ng-dirty': resetForm.get('new_password')?.invalid && resetForm.get('new_password')?.touched}">

                <ng-template pTemplate="header">
                    <h6 class="mt-0 mb-2 font-semibold">Password Requirements</h6>
                </ng-template>

                <ng-template pTemplate="footer">
                    <p-divider></p-divider>
                    <ul class="pl-2 ml-2 mt-0 line-height-3 list-none">
                        <li class="flex align-items-center mb-2">
                            <i [class]="(resetForm.get('new_password')?.value?.length || 0) >= 8 ? 'pi pi-check text-green-500' : 'pi pi-circle text-surface-400'" class="mr-2 text-xs"></i>
                            <span [ngClass]="{'text-green-500': (resetForm.get('new_password')?.value?.length || 0) >= 8}">Minimum 8 characters</span>
                        </li>
                        <li class="flex align-items-center mb-2">
                            <i [class]="hasUppercase(resetForm.get('new_password')?.value || '') ? 'pi pi-check text-green-500' : 'pi pi-circle text-surface-400'" class="mr-2 text-xs"></i>
                            <span [ngClass]="{'text-green-500': hasUppercase(resetForm.get('new_password')?.value || '')}">At least one uppercase letter</span>
                        </li>
                        <li class="flex align-items-center mb-2">
                            <i [class]="hasLowercase(resetForm.get('new_password')?.value || '') ? 'pi pi-check text-green-500' : 'pi pi-circle text-surface-400'" class="mr-2 text-xs"></i>
                            <span [ngClass]="{'text-green-500': hasLowercase(resetForm.get('new_password')?.value || '')}">At least one lowercase letter</span>
                        </li>
                        <li class="flex align-items-center mb-2">
                            <i [class]="hasNumber(resetForm.get('new_password')?.value || '') ? 'pi pi-check text-green-500' : 'pi pi-circle text-surface-400'" class="mr-2 text-xs"></i>
                            <span [ngClass]="{'text-green-500': hasNumber(resetForm.get('new_password')?.value || '')}">At least one number</span>
                        </li>
                        <li class="flex align-items-center mb-2">
                            <i [class]="hasSymbol(resetForm.get('new_password')?.value || '') ? 'pi pi-check text-green-500' : 'pi pi-circle text-surface-400'" class="mr-2 text-xs"></i>
                            <span [ngClass]="{'text-green-500': hasSymbol(resetForm.get('new_password')?.value || '')}">At least one special symbol</span>
                        </li>
                    </ul>
                </ng-template>
            </p-password>
        </div>

        <div class="gap-2 mt-2 mb-6">
            <label for="phoneInput" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Confirm New Password</label>
            <p-password
                formControlName="confirm_password"
                [toggleMask]="true"
                [feedback]="false"
                styleClass="w-full"
                inputStyleClass="w-full h-12 rounded-xl"
                placeholder="Re-enter password"
                [ngClass]="{'ng-invalid ng-dirty': resetForm.errors?.['mismatch'] && resetForm.get('confirm_password')?.touched}">
            </p-password>
            <small *ngIf="resetForm.errors?.['mismatch'] && resetForm.get('confirm_password')?.touched" class="p-error block mt-1">
                Passwords do not match.
            </small>
        </div>

        <p-button
            label="Update Password"
            [loading]="isLoading()"
            type="submit"
            styleClass="w-full rounded-pill py-3"
            [disabled]="resetForm.invalid" />
    </form>

    <div class="mt-8 pt-4 mb-5 border-t border-surface-200 dark:border-surface-700 text-center">
        <p class="mb-0">
          Wait, I remember my password...
            <a [routerLink]="'/account/login'" class="text-primary font-medium no-underline hover:underline">Login</a>
        </p>
    </div>

    `
})
export class ConfirmReset implements OnInit {
    private fb = inject(NonNullableFormBuilder);
    private authService = inject(Auth);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private messageService = inject(MessageService);

    isLoading = signal(false);
    message = signal<string | null>(null);
    uid = '';
    token = '';

    resetForm = this.fb.group({
        new_password: ['', [Validators.required, Validators.minLength(8)]],
        confirm_password: ['', [Validators.required]]
    }, {
        validators: (group) => group.get('new_password')?.value === group.get('confirm_password')?.value ? null : { mismatch: true }
    });

    ngOnInit() {
        this.uid = this.route.snapshot.paramMap.get('uid') || '';
        this.token = this.route.snapshot.paramMap.get('token') || '';

        if (!this.uid || !this.token) {
            this.router.navigate(['/account/login']);
        }
    }

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

    onSubmit() {
        if (this.resetForm.invalid) {
            if (this.resetForm.hasError('mismatch')) this.message.set("Passwords do not match.");
            return;
        }

        this.isLoading.set(true);
        this.message.set(null);

        const payload = {
            ...this.resetForm.getRawValue(),
            uid: this.uid,
            token: this.token
        };

        this.authService.confirmForgotPasswordReset(payload)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (res) => {
                    this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Password changed! Redirecting...', life: 3000 });
                    setTimeout(() => this.router.navigate(['/account/login']), 3000);
                },
                error: (err) => {
                    this.message.set(err.error?.error || err.error?.detail || 'Invalid or expired link.');
                }
            });
    }
}
