import { Component, OnInit, signal, inject } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, NonNullableFormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../shared/environment/env_file';
import { InventoryService } from '../../../shared/services/inventory-service';

interface User {
    id?: number;
    email: string;
    is_staff: boolean;
    is_verified: boolean;
    groups?: number[];
    assigned_location?: number;
    assigned_location_name?: string;
}

interface UserForm {
    email: FormControl<string>;
    groups: FormControl<number[]>;
    assigned_location: FormControl<any>; // Changed to any to hold the location object
}

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [
        CommonModule, TableModule, FormsModule, ReactiveFormsModule, ButtonModule, RippleModule,
        ToastModule, ToolbarModule, InputTextModule, MultiSelectModule, AutoCompleteModule,
        DialogModule, TagModule, ConfirmDialogModule
    ],
    template: `
        <p-toast />

        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="Add Staff" icon="pi pi-plus" severity="secondary" (onClick)="openNew()" />
            </ng-template>
        </p-toolbar>

        <p-table #dt [value]="users()" [rows]="10" [paginator]="true" [loading]="isLoading()" [rowHover]="true">
            <ng-template #header>
                <tr>
                    <th>Email</th>
                    <th>Assigned Location</th>
                    <th>Role Status</th>
                    <th style="width: 5rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-user>
                <tr>
                    <td>{{ user.email }}</td>
                    <td>
                        <span class="font-medium">{{ user.assigned_location_name || 'Not Assigned' }}</span>
                    </td>
                    <td>
                        <p-tag [value]="user.is_staff ? 'STAFF' : 'CLIENT'"
                               [severity]="user.is_staff ? 'success' : 'info'" />
                    </td>
                    <td>
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteUser(user)" />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="userDialog" [style]="{ width: '450px' }" header="Register New Staff" [modal]="true">
            <ng-template #content>
                <form [formGroup]="userForm" class="flex flex-col gap-4">
                    <div>
                        <label for="email" class="block font-bold mb-2">Staff Email</label>
                        <input id="email" type="email" pInputText formControlName="email" class="w-full" placeholder="email@company.com" />
                        <small class="p-error" *ngIf="submitted && userForm.get('email')?.invalid">A valid email is required.</small>
                    </div>

                    <div>
                        <label class="block font-bold mb-2">Assigned Location (Search)</label>
                        <p-autoComplete
                            formControlName="assigned_location"
                            [suggestions]="filteredLocations"
                            (completeMethod)="filterLocation($event)"
                            field="name"
                            dataKey="id"
                            [forceSelection]="true"
                            placeholder="Type to search outlet..."
                            styleClass="w-full"
                            [style]="{'width':'100%'}"
                            [inputStyle]="{'width':'100%'}"
                            appendTo="body">
                        </p-autoComplete>
                        <small class="p-error" *ngIf="submitted && userForm.get('assigned_location')?.invalid">Please select a location.</small>
                    </div>

                    <div>
                        <label class="block font-bold mb-2">Permissions / Groups</label>
                        <p-multiSelect
                            formControlName="groups"
                            [options]="availableGroups()"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Select Roles"
                            styleClass="w-full"
                            appendTo="body" />
                    </div>
                </form>
            </ng-template>

            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (click)="userDialog = false" />
                <p-button label="Create Staff Account" icon="pi pi-check" (click)="saveUser()" [loading]="isLoading()" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
    `,
    providers: [MessageService, ConfirmationService]
})
export class Users implements OnInit {

    private baseUrl = `${environment.apiUrl}`;
    private apiUrl = `${this.baseUrl}auth/users/`;

    private http = inject(HttpClient);
    private fb = inject(NonNullableFormBuilder);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private inventoryService = inject(InventoryService);

    // Signals
    users = signal<User[]>([]);
    availableGroups = signal<any[]>([]);

    // AutoComplete State
    filteredLocations: any[] = [];

    userDialog: boolean = false;
    isLoading = signal(false);
    submitted = false;

    userForm: FormGroup<UserForm> = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        groups: [[] as number[]],
        assigned_location: [null as any, [Validators.required]],
    });

    ngOnInit() {
        this.loadUsers();
        this.loadMetadata();
    }

    loadUsers() {
        this.isLoading.set(true);
        this.http.get<User[]>(this.apiUrl).subscribe({
            next: (res) => {
                this.users.set(res);
                this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false)
        });
    }

    loadMetadata() {
        // Only loading groups; locations are loaded via search now
        this.http.get<any[]>(`${environment.apiUrl}auth/groups/`).subscribe(res => this.availableGroups.set(res));
    }

    filterLocation(event: any) {
        this.inventoryService.searchLocations(event.query).subscribe(data => {
            this.filteredLocations = data;
        });
    }

    openNew() {
        this.userForm.reset();
        this.submitted = false;
        this.userDialog = true;
    }

    saveUser() {
        this.submitted = true;
        if (this.userForm.invalid) return;

        this.isLoading.set(true);
        const formValue = this.userForm.getRawValue();

        // TRANSFORM: Extract the ID from the location object for the backend
        const payload = {
            ...formValue,
            assigned_location: formValue.assigned_location?.id
        };

        this.http.post(`${this.apiUrl}register_staff/`, payload)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (res: any) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: res.message || 'Staff registered successfully'
                    });
                    this.loadUsers();
                    this.userDialog = false;
                },
                error: (err) => {
                    // Capture Django validation errors (e.g. "user with this email already exists")
                    const detail = err.error?.email ? `Email: ${err.error.email[0]}` : (err.error?.detail || 'Registration failed');
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: detail });
                }
            });
    }

    deleteUser(user: User) {
        this.confirmationService.confirm({
            header: 'Confirm Deletion',
            message: `Are you sure you want to delete the user account for ${user.email}?`,
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.http.delete(`${this.apiUrl}${user.id}/`).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'User removed successfully' });
                        this.loadUsers();
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete user' });
                    }
                });
            }
        });
    }
}
