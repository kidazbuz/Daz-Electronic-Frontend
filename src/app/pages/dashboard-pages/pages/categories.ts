import { Component, OnInit, signal, ViewChild, inject } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, NonNullableFormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../shared/environment/env_file';
import { ProductCategory } from '../../../shared/interfaces/setups';

interface Column {
    field: string;
    header: string;
}

interface CartegoryForm {
    name: FormControl<string>;
    description: FormControl<string>;
    is_digital: FormControl<string>;
    status: FormControl<string>;
}

@Component({
    selector: 'app-cartegories',
    standalone: true,
    imports: [
        CommonModule, TableModule, FormsModule, ReactiveFormsModule, ButtonModule, RippleModule,
        ToastModule, ToolbarModule, InputTextModule, TextareaModule, SelectModule,
        DialogModule, TagModule, IconFieldModule, InputIconModule, ConfirmDialogModule
    ],
    template: `
        <p-toast />

        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="New Category" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
            </ng-template>

            <ng-template #end>
                <p-button label="Export" icon="pi pi-upload" severity="secondary" (onClick)="dt.exportCSV()" />
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="categories()"
            [rows]="10"
            [paginator]="true"
            [globalFilterFields]="['name', 'description']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [(selection)]="selectedCategories"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} categories"
            [showCurrentPageReport]="true"
            [loading]="isLoading()"
        >
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <div class="font-semibold text-xl mb-4">Manage Product Categories</div>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search..." />
                    </p-iconfield>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th style="width: 3rem"><p-tableHeaderCheckbox /></th>
                    <th pSortableColumn="name">Name <p-sortIcon field="name" /></th>
                    <th>Description</th>
                    <th pSortableColumn="is_digital">Type <p-sortIcon field="is_digital" /></th>
                    <th pSortableColumn="status">Status <p-sortIcon field="status" /></th>
                    <th style="width: 8rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-cat>
                <tr>
                    <td><p-tableCheckbox [value]="cat" /></td>
                    <td style="font-weight: 600;">{{ cat.name }}</td>
                    <td>{{ cat.description }}</td>
                    <td>
                        <p-tag [value]="cat.is_digital ? 'Digital' : 'Physical'" [severity]="cat.is_digital ? 'info' : 'secondary'" />
                    </td>
                    <td>
                        <p-tag [value]="cat.status ? 'Active' : 'Inactive'" [severity]="getSeverity(cat.status)" />
                    </td>
                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editCategory(cat)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteCategory(cat)" />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="categoryDialog" [style]="{ width: '450px' }" [header]="modalMode === 'edit' ? 'Edit Category' : 'New Category'" [modal]="true">
            <ng-template #content>
                <form [formGroup]="categoryForm" class="flex flex-col gap-4">
                    <div>
                        <label for="name" class="block font-bold mb-2">Name</label>
                        <input type="text" pInputText id="name" formControlName="name" fluid />
                        <small class="p-error" *ngIf="submitted && categoryForm.get('name')?.invalid">Name is required.</small>
                    </div>
                    <div>
                        <label for="description" class="block font-bold mb-2">Description</label>
                        <textarea id="description" pTextarea formControlName="description" rows="3" fluid></textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-bold mb-2">Type</label>
                            <p-select formControlName="is_digital" [options]="digitalOptions" optionLabel="label" optionValue="value" fluid />
                        </div>
                        <div>
                            <label class="block font-bold mb-2">Status</label>
                            <p-select formControlName="status" [options]="statusOptions" optionLabel="label" optionValue="value" fluid />
                        </div>
                    </div>
                </form>
            </ng-template>

            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (click)="saveCategory()" [loading]="isLoading()" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
    `,
    providers: [MessageService, ConfirmationService]
})
export class Categories implements OnInit {
    private categoryUrl = `${environment.apiUrl}setups/categories/`;
    private http = inject(HttpClient);
    private fb = inject(NonNullableFormBuilder);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    // Signals & State
    categories = signal<ProductCategory[]>([]);
    categoryDialog: boolean = false;
    selectedCategories!: ProductCategory[] | null;
    submitted: boolean = false;
    isLoading = signal(false);
    modalMode: 'create' | 'edit' = 'create';
    currentId: number | null = null;

    digitalOptions = [{ label: 'Digital', value: 'true' }, { label: 'Physical', value: 'false' }];
    statusOptions = [{ label: 'Active', value: 'true' }, { label: 'Inactive', value: 'false' }];

    categoryForm: FormGroup<CartegoryForm> = this.fb.group({
        name: ['', [Validators.required]],
        description: ['', [Validators.required]],
        is_digital: ['false', [Validators.required]],
        status: ['true', [Validators.required]],
    });

    ngOnInit() {
        this.loadAll();
    }

    loadAll(): void {
        this.isLoading.set(true);
        this.http.get<ProductCategory[]>(this.categoryUrl).subscribe({
            next: (res) => {
                this.categories.set(res);
                this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false)
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.modalMode = 'create';
        this.currentId = null;
        this.categoryForm.reset({ status: 'true', is_digital: 'false' });
        this.submitted = false;
        this.categoryDialog = true;
    }

    editCategory(cat: ProductCategory) {
        this.modalMode = 'edit';
        this.currentId = cat.id ?? null;
        this.categoryForm.patchValue({
            name: cat.name,
            description: cat.description,
            is_digital: String(cat.is_digital),
            status: String(cat.status)
        });
        this.categoryDialog = true;
    }

    hideDialog() {
        this.categoryDialog = false;
        this.submitted = false;
    }

    saveCategory() {
        this.submitted = true;
        if (this.categoryForm.invalid) return;

        this.isLoading.set(true);
        const payload = this.categoryForm.getRawValue();
        const request$ = this.modalMode === 'edit'
            ? this.http.put(`${this.categoryUrl}${this.currentId}/`, payload)
            : this.http.post(this.categoryUrl, payload);

        request$.pipe(finalize(() => this.isLoading.set(false))).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: `Category ${this.modalMode}ed` });
                this.loadAll();
                this.categoryDialog = false;
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Operation failed' })
        });
    }

    deleteCategory(cat: ProductCategory) {
        this.confirmationService.confirm({
            message: `Delete ${cat.name}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.http.delete(`${this.categoryUrl}${cat.id}/`).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Category removed' });
                        this.loadAll();
                    }
                });
            }
        });
    }

    getSeverity(status: any) {
        return (status === 'true' || status === true) ? 'success' : 'danger';
    }
}
