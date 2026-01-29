import { Component, OnInit, signal, ViewChild, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

// PrimeNG Imports
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';

import { SalesService } from '../../../shared/services/sales-service';
import { Auth } from '../../../shared/services/auth';

@Component({
    selector: 'app-sales-view',
    standalone: true,
    imports: [
        CommonModule, TableModule, FormsModule, ButtonModule, ToastModule,
        ToolbarModule, InputTextModule, DialogModule, TagModule, SelectModule,
        IconFieldModule, InputIconModule, ConfirmDialogModule, InputNumberModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
    <p-toast />
<p-confirmdialog />

<div class="card p-4 bg-surface-0 dark:bg-surface-900 text-color border-round shadow-2">

    <p-toolbar styleClass="mb-6 border-none bg-surface-50 dark:bg-surface-800">
        <ng-template #start>
            <p-button label="New Sale" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openAddNewPage()" />
        </ng-template>

        <ng-template #end>
            <p-button *ngIf="hasSalesToday()" label="Close Sales Day" icon="pi pi-lock" severity="danger"
                      (onClick)="confirmCloseDay()" [loading]="isLoading" />
            <p-button label="Export" icon="pi pi-upload" severity="secondary"
                      styleClass="ml-2" (onClick)="dt.exportCSV()" />
        </ng-template>
    </p-toolbar>

    <p-table
        #dt
        [value]="sales()"
        dataKey="id"
        [rows]="10"
        [paginator]="true"
        [globalFilterFields]="['customer.first_name', 'customer.last_name', 'payment_status']"
        [tableStyle]="{ 'min-width': '75rem' }"
        styleClass="p-datatable-striped"
    >
        <ng-template #caption>
            <div class="flex items-center justify-between">
                <h5 class="m-0 text-xl font-semibold">Manage Transactions</h5>
                <p-iconfield>
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search Sales..." />
                </p-iconfield>
            </div>
        </ng-template>

        <ng-template #header>
            <tr>
                <th pSortableColumn="sale_date">Date <p-sortIcon field="sale_date" /></th>
                <th>Customer</th>
                <th pSortableColumn="total_amount">Total <p-sortIcon field="total_amount" /></th>
                <th>Amount Paid</th>
                <th>Due Balance</th>
                <th>Status</th>
                <th class="text-center" style="width: 10rem">Actions</th>
            </tr>
        </ng-template>

        <ng-template #body let-sale>
            <tr class="hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                <td>{{ sale.sale_date | date: 'medium' }}</td>
                <td>
                    {{ sale.customer?.first_name ? (sale.customer.first_name + ' ' + (sale.customer.last_name || '') | titlecase) : 'N/A' }}
                </td>
                <td class="font-bold">{{ sale.total_amount | number }}</td>
                <td class="text-green-600 dark:text-green-400 font-medium">{{ sale.amount_paid | number }}</td>
                <td class="text-red-600 dark:text-red-400 font-medium">{{ sale.balance_due | number }}</td>
                <td>
                    <p-tag [value]="sale.payment_status" [severity]="getSeverity(sale.payment_status)" />
                </td>

                <td class="p-4">
                    <div class="flex items-center justify-center gap-3">
                        <p-button
                            icon="pi pi-plus"
                            *ngIf="sale.payment_status != 'Paid'"
                            severity="success"
                            [rounded]="true"
                            [outlined]="true"
                            pTooltip="Add Payment"
                            (onClick)="openAddPayment(sale)" />

                        <p-button
                            icon="pi pi-eye"
                            [rounded]="true"
                            [outlined]="true"
                            pTooltip="View Details"
                            (onClick)="viewSaleDetails(sale)" />
                    </div>
                </td>
            </tr>
        </ng-template>

        <ng-template #emptymessage>
            <tr>
                <td colspan="7" class="text-center p-8 text-surface-400 italic">
                    No transactions found.
                </td>
            </tr>
        </ng-template>
    </p-table>
</div>

<p-dialog [(visible)]="detailsDialog" [style]="{ width: '700px' }" header="Detailed Sales Report" [modal]="true" [draggable]="false" [resizable]="false">
    <ng-template #content>
        <div *ngIf="selectedSale" class="flex flex-col gap-6 py-2">

            <div class="flex justify-between items-start border-b border-surface-200 dark:border-surface-700 pb-4">
                <div class="flex flex-col gap-1">
                    <label class="text-xs font-bold text-color-secondary uppercase tracking-widest">Transaction Reference</label>
                    <span class="text-2xl font-mono text-primary font-bold">#{{ selectedSale.id }}</span>
                    <span class="text-sm text-color-secondary"><i class="pi pi-calendar mr-1"></i>{{ selectedSale.sale_date | date:'medium' }}</span>
                </div>
                <div class="flex flex-col items-end gap-2">
                    <p-tag [value]="selectedSale.status" [severity]="getSeverity(selectedSale.status)" styleClass="text-sm px-3" />
                    <p-tag [value]="selectedSale.payment_status" severity="secondary" outlined />
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4" *ngIf="canAccess(['Manager', 'Chief Executive Officer (CEO)', 'System Administrator'])">
                <div class="p-3 border-round bg-surface-50 dark:bg-surface-800 border-1 border-surface-200 dark:border-surface-700">
                    <label class="block text-xs font-bold text-color-secondary mb-2 uppercase">Sales Origin</label>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-map-marker text-primary"></i>
                        <span class="font-medium">{{ selectedSale.sales_outlet }}</span>
                    </div>
                </div>
                <div class="p-3 border-round bg-surface-50 dark:bg-surface-800 border-1 border-surface-200 dark:border-surface-700">
                    <label class="block text-xs font-bold text-color-secondary mb-2 uppercase">Sales Agent</label>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-user text-primary"></i>
                        <span class="font-medium">{{ selectedSale.sales_agent }}</span>
                    </div>
                </div>
            </div>

            <div class="border-round border-1 border-surface-200 dark:border-surface-700 p-4">
                <h4 class="m-0 mb-3 text-900 flex items-center gap-2 border-b border-surface-100 dark:border-surface-800 pb-2">
                    <i class="pi pi-id-card text-primary"></i> Customer Information
                </h4>
                <div class="grid grid-cols-2 gap-y-3">
                    <div class="flex flex-col">
                        <small class="text-color-secondary">Full Name</small>
                        <span class="font-bold">{{ selectedSale.customer?.first_name }} {{ selectedSale.customer?.last_name }}</span>
                    </div>
                    <div class="flex flex-col">
                        <small class="text-color-secondary">Phone Number</small>
                        <span class="font-bold">{{ selectedSale.customer?.phone_number }}</span>
                    </div>
                    <div class="flex flex-col col-span-2">
                        <small class="text-color-secondary">Email Address</small>
                        <span class="font-medium">{{ selectedSale.customer?.email }}</span>
                    </div>
                </div>
            </div>

            <div class="surface-card p-4 border-round shadow-1 border-1 border-primary-100 dark:border-primary-900">
                <h4 class="m-0 font-bold mb-4 flex justify-between items-center">
                    <span class="flex items-center gap-2"><i class="pi pi-shopping-bag"></i> Inventory Items</span>
                    <span class="text-sm font-normal text-color-secondary">{{ selectedSale.items?.length }} Items</span>
                </h4>

                <div *ngFor="let item of selectedSale.items"
                     class="flex justify-between items-center py-3 border-b border-surface-100 dark:border-surface-800 last:border-none">
                    <div class="flex flex-col">
                        <span class="font-bold text-900">{{ item.product_name }}</span>
                        <div class="flex gap-2 text-xs text-color-secondary mt-1">
                            <span class="bg-surface-200 dark:bg-surface-700 px-2 border-round">SKU: {{item.product_sku}}</span>
                            <span>Model: {{item.model}}</span>
                            <span class="font-bold text-primary">x{{ item.quantity }} {{item.unit_measure}}</span>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="font-mono font-bold text-lg text-900">{{ item.unit_price | number }}</div>
                        <small class="text-xs text-color-secondary">per {{item.unit_measure}}</small>
                    </div>
                </div>

                <div class="mt-4">
                <h4 class="m-0 font-bold mb-3 flex items-center gap-2 text-900">
                    <i class="pi pi-history text-primary"></i> Payment History
                </h4>

                <p-table [value]="selectedSale.payments" styleClass="p-datatable-sm p-datatable-striped" [tableStyle]="{'min-width': '100%'}">
                    <ng-template #header>
                        <tr>
                            <th class="text-xs uppercase bg-surface-50 dark:bg-surface-800">Date</th>
                            <th class="text-xs uppercase bg-surface-50 dark:bg-surface-800">Method</th>
                            <th class="text-xs uppercase bg-surface-50 dark:bg-surface-800">Reference</th>
                            <th class="text-xs uppercase bg-surface-50 dark:bg-surface-800 text-right">Amount</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-payment>
                        <tr class="text-sm">
                            <td>{{ payment.date_paid | date:'medium' }}</td>
                            <td>
                                <span class="flex items-center gap-1">
                                    <i class="pi pi-wallet text-xs text-color-secondary"></i>
                                    {{ payment.method }}
                                </span>
                            </td>
                            <td class="font-mono text-xs">{{ payment.reference_id || 'N/A' }}</td>
                            <td class="text-right font-bold text-green-600">{{ payment.amount | number }}</td>
                        </tr>
                    </ng-template>
                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="4" class="text-center py-3 text-color-secondary italic text-sm">
                                No payments recorded yet.
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>

            <div class="mt-4 pt-4 border-t-2 border-dashed border-surface-300 dark:border-surface-600">
                <div class="flex justify-between mb-2">
                    <span class="text-color-secondary font-medium">Subtotal Amount</span>
                    <span class="font-mono text-900">{{ selectedSale.total_amount | number }} TSh</span>
                </div>
                <div class="flex justify-between mb-2">
                    <span class="text-green-600 font-medium font-bold">Total Paid (Marejesho)</span>
                    <span class="font-mono text-green-600 font-bold">- {{ selectedSale.amount_paid | number }} TSh</span>
                </div>

                <div class="flex justify-between items-center mt-3 p-4 bg-primary-50 dark:bg-primary-900 border-round shadow-sm">
                    <div class="flex flex-col">
                        <span class="text-primary font-bold text-lg">Balance Due</span>
                        <small class="text-primary-600 dark:text-primary-300" *ngIf="selectedSale.balance_due > 0">Remaining debt to be cleared</small>
                        <small class="text-green-600 dark:text-green-400 font-bold" *ngIf="selectedSale.balance_due <= 0">SALE FULLY PAID</small>
                    </div>
                    <span class="font-mono text-primary font-black text-2xl">
                        {{ selectedSale.balance_due | number }} TSh
                    </span>
                </div>
            </div>
            </div>
        </div>
    </ng-template>

    <ng-template #footer>
        <div class="flex justify-between w-full">
            <p-button label="Download PDF" icon="pi pi-file-pdf" severity="warn" [text]="true" />
            <div class="flex gap-2">
                <p-button label="Print Receipt" icon="pi pi-print" [outlined]="true" />
                <p-button label="Close" icon="pi pi-times" (onClick)="detailsDialog = false" severity="secondary" />
            </div>
        </div>
    </ng-template>
</p-dialog>

<p-dialog [(visible)]="summaryDialog" [style]="{ width: '450px' }" header="Day Finalization" [modal]="true" [closable]="false">
    <div class="flex flex-col items-center gap-4 py-6" *ngIf="isSuccess">
        <i class="pi pi-check-circle text-green-500 text-7xl mb-2"></i>
        <h3 class="text-2xl font-bold text-center m-0">{{ message }}</h3>

        <div class="w-full bg-surface-50 dark:bg-surface-800 p-4 border-round-xl border-1 border-surface-200 dark:border-surface-700 mt-2">
             <div class="flex justify-between mb-3 text-lg">
                <span class="text-color-secondary">Total Sales:</span>
                <span class="font-bold text-900">{{ summary?.total_sales }}</span>
             </div>
             <div class="flex justify-between text-xl pt-2 border-t border-surface-300">
                <span class="font-bold">Net Revenue:</span>
                <span class="font-black text-primary">{{ summary?.total_revenue | number }} TSh</span>
             </div>
        </div>
    </div>

    <div class="flex flex-col items-center gap-4 py-6" *ngIf="!isSuccess">
        <i class="pi pi-exclamation-triangle text-red-500 text-7xl"></i>
        <p class="text-xl font-medium text-center px-4">{{ message }}</p>
    </div>

    <ng-template #footer>
        <div class="flex justify-center w-full">
            <p-button label="Acknowledge" icon="pi pi-check" (onClick)="summaryDialog = false" class="w-full" />
        </div>
    </ng-template>
</p-dialog>

<p-dialog [(visible)]="paymentDialog" [style]="{ width: '450px' }" header="Record New Payment" [modal]="true">
    <ng-template #content>
        <div class="flex flex-col gap-4 pt-2">
            <div class="flex flex-col gap-2">
                <label class="font-bold">Amount (TZS)</label>
                <p-inputnumber [(ngModel)]="paymentRequest.amount"
                               mode="decimal"
                               [minFractionDigits]="0"
                               placeholder="Enter amount"
                               class="w-full" [fluid]="true" />
                <small class="text-red-500" *ngIf="submitted && !paymentRequest.amount">Amount is required.</small>
            </div>

            <div class="flex flex-col gap-2">
                <label class="font-bold">Payment Method</label>
                <p-select [(ngModel)]="paymentRequest.method"
                          [options]="paymentMethods"
                          optionLabel="label"
                          optionValue="value"
                          placeholder="Select a Method"
                          class="w-full" [fluid]="true" />
            </div>

            <div class="flex flex-col gap-2" *ngIf="['MOMO', 'Card', 'Transfer'].includes(paymentRequest.method)">
                <label class="font-bold">Reference ID / Transaction ID</label>
                <input pInputText type="text" [(ngModel)]="paymentRequest.reference_id"
                       placeholder="Enter reference number" class="w-full" />
            </div>
        </div>
    </ng-template>

    <ng-template #footer>
        <p-button label="Cancel" [text]="true" (onClick)="paymentDialog = false" />
        <p-button label="Add Payment" icon="pi pi-check" (onClick)="savePayment()" [loading]="isSaving" />
    </ng-template>
</p-dialog>
    `
})
export class SalesView implements OnInit {

    sales = signal<any[]>([]);
    expandedRows = {};
    detailsDialog: boolean = false;
    selectedSale: any = null;
    summaryDialog: boolean = false;

    isLoading: boolean = false;
    isSuccess: boolean = false;
    message: string | null = null;
    summary: any = null;
    allowedRoles: string = '';

    constructor(
        private salesService: SalesService,
        private messageService: MessageService,
        private authService: Auth,
        private router: Router,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadSales();
    }

    loadSales() {
        this.salesService.getSales().subscribe(data => this.sales.set(data));
    }

    hasSalesToday = computed(() => {
      const today = new Date().toLocaleDateString('en-CA');

      return this.sales().some(sale => {
        if (!sale.sale_date) return false;
        const recordDate = new Date(sale.sale_date).toLocaleDateString('en-CA');
        return recordDate === today;
      });
    });

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    viewSaleDetails(sale: any) {
        this.selectedSale = sale;
        this.detailsDialog = true;
    }

    paymentDialog: boolean = false;
    isSaving: boolean = false;
    submitted: boolean = false;

    paymentRequest: any = {
        sale: 0,
        amount: '',
        method: 'Uknown',
        reference_id: ''
    };

    paymentMethods = [
        { label: 'Mobile Money', value: 'MOMO' },
        { label: 'Bank Transfer', value: 'Transfer' },
        { label: 'Credit/Debit Card', value: 'Card' },
        { label: 'Cash', value: 'Cash' },
        { label: 'Uknown', value: 'Uknown' },

    ];

    openAddPayment(sale: any) {
        this.submitted = false;
        this.paymentRequest = {
            sale: sale.id,
            amount: null,
            method: 'Cash',
            reference_id: ''
        };
        this.paymentDialog = true;
    }

    savePayment() {
        this.submitted = true;

        if (!this.paymentRequest.amount || this.paymentRequest.amount <= 0) {
            return;
        }

        this.isSaving = true;

        this.salesService.addPayment(this.paymentRequest.sale, this.paymentRequest).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Payment Added Successfully'
                });
                this.paymentDialog = false;
                this.loadSales();
                this.isSaving = false;
            },
            error: (err) => {
                this.isSaving = false;

                let errorMessage = 'Failed to add payment';

                if (err.error) {
                    if (err.error.amount && Array.isArray(err.error.amount)) {
                        errorMessage = err.error.amount[0];
                    } else if (err.error.detail) {
                        errorMessage = err.error.detail;
                    } else if (typeof err.error === 'string') {
                        errorMessage = err.error;
                    }
                }

                this.messageService.add({
                    severity: 'error',
                    summary: 'Transaction Failed',
                    detail: errorMessage,
                    life: 5000
                });
            }
        });
    }

    confirmCloseDay() {
    this.confirmationService.confirm({
        header: 'Security Confirmation',
        icon: 'pi pi-exclamation-triangle',
        message: 'Are you sure you want to close the sales day? We recommend reviewing your summary first to ensure all totals match.',
        acceptLabel: 'Close Day Now',
        rejectLabel: 'Review Summary First',
        acceptButtonStyleClass: 'p-button-danger',
        rejectButtonStyleClass: 'p-button-outlined',
        accept: () => {
            this.closeSalesDay();
        },
        reject: () => {
            // Redirect the user to the summary page instead of just closing the dialog
            this.router.navigate(['/dashboard/sales-summary']);
        }
    });
}

    closeSalesDay(): void {
        this.isLoading = true;
        this.message = null;
        this.summary = null;
        this.isSuccess = false;

        this.salesService.closeDay().subscribe({
            next: (response: any) => {
                this.message = response.detail;
                this.summary = response.summary;
                this.isSuccess = true;
                this.isLoading = false;
                this.summaryDialog = true;
            },
            error: (error: HttpErrorResponse) => {
                this.isSuccess = false;
                this.isLoading = false;
                this.message = error.error?.detail || "An error occurred while closing the day.";
                this.summaryDialog = true;
            }
        });
    }

    getSeverity(status: string) {
        switch (status) {
            case 'COMPLETED':
            case 'PAID':
                return 'success';
            case 'PENDING':
                return 'warn';
            case 'CANCELLED':
                return 'danger';
            default:
                return 'info';
        }
    }

    openAddNewPage(){
      return this.router.navigate(['/dashboard/sales']);
    }

    canAccess(allowedGroups: string[]): boolean {
        return allowedGroups.some(group => this.authService.userInGroup(group));
    }
}
