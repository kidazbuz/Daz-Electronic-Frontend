import { Component, signal, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { NonNullableFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../shared/services/auth';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, RouterModule, ButtonModule, InputTextModule, ToastModule],
    providers: [MessageService],
    template: `
    <p-toast />

    <div class="text-center mb-4 mt-8 py-5">

        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Forgot Password!</div>
        <span class="text-muted-color font-medium">Enter email to receive a reset link</span>
    </div>

    <div *ngIf="message()" class="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl border border-red-200 text-center">
        <div class="text-sm"><i class="pi pi-exclamation-circle mr-1"></i> {{ message() }}</div>
    </div>

    <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()">

        <div class="mb-6">
            <label for="phoneInput" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
            <input
                pInputText
                id="email"
                type="email"
                formControlName="email"
                placeholder="Enter Email Address *"
                class="w-full h-12 rounded-xl"
                [fluid]="true"
                [ngClass]="{'ng-invalid ng-dirty': forgotForm.get('email')?.invalid && forgotForm.get('email')?.touched}"
            />

                <span class="text-red-500 text-sm block mt-1" *ngIf="forgotForm.get('email')?.invalid && forgotForm.get('email')?.touched">
                    <ng-container *ngIf="forgotForm.get('email')?.hasError('required')">Email is required.</ng-container>
                    <ng-container *ngIf="forgotForm.get('email')?.hasError('email')">Please enter a valid email address.</ng-container>
                    <ng-container *ngIf="forgotForm.get('email')?.hasError('server')">{{ forgotForm.get('email')?.getError('server') }}</ng-container>
                </span>
        </div>

        <p-button
            type="submit"
            [label]="isLoading() ? 'Sending...' : 'Send Reset Link'"
            [icon]="isLoading() ? 'pi pi-spin pi-spinner' : ''"
            styleClass="w-full rounded-pill py-3"
            [disabled]="forgotForm.invalid || isLoading()">
        </p-button>

        <div class="mt-8 pt-4 border-t border-surface-200 dark:border-surface-700 text-center">
            <p class="mb-0">

                <a [routerLink]="'/account/login'" class="text-primary font-medium no-underline hover:underline"><i class="pi pi-arrow-left mr-2"></i>Back to Login</a>
            </p>
        </div>

    </form>
    `
})
export class ForgotPassword {

    private fb = inject(NonNullableFormBuilder);
    private authService = inject(Auth);
    private messageService = inject(MessageService);

    isLoading = signal(false);
    message = signal<string | null>(null);
    copyrightYear = new Date().getFullYear();

    forgotForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
    });

    onSubmit() {
        if (this.forgotForm.invalid) {
            this.forgotForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);
        this.message.set(null);

        this.authService.requestForgotPasswordLink(this.forgotForm.getRawValue().email)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (res) => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: res.detail, life: 5000 });
                    this.forgotForm.reset();
                },
                error: (err) => {
                    this.message.set(err.error?.email?.[0] || err.error?.detail || 'Account not found.');
                }
            });
    }
}
