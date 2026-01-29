import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';

import { SalesService } from '../../../shared/services/sales-service';

@Component({
    selector: 'app-sales',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        StepperModule,
        ButtonModule,
        ToastModule,
        DialogModule,
        AutoCompleteModule,
        InputTextModule,
        InputNumberModule,
        SelectModule,
        CardModule
    ],
    providers: [MessageService],
    template: `
    <p-toast />

    <div class="card">
        <div class="font-semibold text-xl mb-4">Manage Sales Records</div>
        <p>Sales Entry: Start adding items to create a new customer order.</p>

        <div class="px-8 py-6 mt-6">
            <ol class="flex items-center w-full text-sm font-medium text-center text-surface-500 dark:text-surface-400 sm:text-base max-w-4xl mx-auto">
                <li class="flex md:w-full items-center sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-surface-200 dark:after:border-surface-700 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10"
                    [class.text-primary]="activeStep >= 1">
                    <span class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-surface-300">
                        <svg *ngIf="activeStep > 1" class="w-5 h-5 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                        </svg>
                        <span *ngIf="activeStep === 1" class="me-2.5 font-bold">1</span>
                        Customer <span class="hidden sm:inline-flex sm:ms-2">Info</span>
                    </span>
                </li>

                <li class="flex md:w-full items-center sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-surface-200 dark:after:border-surface-700 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10"
                    [class.text-primary]="activeStep >= 2">
                    <span class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-surface-300">
                        <svg *ngIf="activeStep > 2" class="w-5 h-5 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                        </svg>
                        <span *ngIf="activeStep <= 2" class="me-2.5 font-bold">2</span>
                        Items <span class="hidden sm:inline-flex sm:ms-2">Info</span>
                    </span>
                </li>

                <li class="flex items-center" [class.text-primary]="activeStep === 3">
                    <span *ngIf="activeStep < 3" class="me-2 font-bold">3</span>
                    <svg *ngIf="activeStep === 3" class="w-5 h-5 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                    </svg>
                    Confirmation
                </li>
            </ol>
        </div>

        <div class="p-6 md:p-8 min-h-[450px] bg-surface-0 dark:bg-surface-900">

            <div *ngIf="activeStep === 1" class="animate-fade-in">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-semibold text-surface-700 dark:text-surface-200">First Name</label>
                        <input pInputText [(ngModel)]="customer.first_name" class="w-full" placeholder="Customer first name">
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-semibold text-surface-700 dark:text-surface-200">Last Name</label>
                        <input pInputText [(ngModel)]="customer.last_name" class="w-full" placeholder="Customer last name">
                    </div>
                    <div class="flex flex-col gap-2 md:col-span-2">
                        <label class="text-sm font-semibold text-surface-700 dark:text-surface-200">Email(option)</label>
                        <input
                          pInputText
                          type="email"
                          name="customerEmail"
                          [(ngModel)]="customer.email"
                          #emailModel="ngModel"
                          email
                          class="w-full h-12 rounded-xl"
                          placeholder="exampleyou@gmail.com"
                          [ngClass]="{'ng-invalid ng-dirty': emailModel.invalid && emailModel.touched}" />

                      <span class="text-red-500 text-sm block mt-1" *ngIf="emailModel.invalid && emailModel.touched">
                          <ng-container *ngIf="emailModel.hasError('email')">Please enter a valid email address.</ng-container>
                          <ng-container *ngIf="emailModel.hasError('server')">{{ emailModel.errors?.['server'] }}</ng-container>
                      </span>
                    </div>
                    <div class="flex flex-col gap-2 md:col-span-2">
                        <label class="text-sm font-semibold text-surface-700 dark:text-surface-200">Phone Number</label>
                        <input pInputText [(ngModel)]="customer.phone_number" class="w-full" placeholder="07XXXXXXXX">
                    </div>
                </div>
                <div class="flex justify-end mt-12 pt-6 border-t border-surface-200 dark:border-surface-800">
                    <p-button label="Next: Add Items" icon="pi pi-arrow-right" iconPos="right" (onClick)="nextStep()" />
                </div>
            </div>

            <div *ngIf="activeStep === 2" class="animate-fade-in">
                <div class="flex flex-col gap-6">
                    <div class="bg-surface-50 dark:bg-surface-800/40 p-4 rounded-xl border border-surface-200 dark:border-surface-700 flex flex-wrap lg:flex-nowrap gap-4 items-end transition-colors">
                        <div class="flex-grow flex flex-col gap-2">
                            <label class="text-xs font-bold text-surface-400 uppercase">Search Product</label>

                            <p-autocomplete
                                [(ngModel)]="selectedProductSpec"
                                [suggestions]="filteredSpecs"
                                (completeMethod)="searchSpecsManual($event)"
                                optionLabel="product_name"
                                placeholder="Start typing name or model..."
                                styleClass="w-full"
                                inputStyleClass="w-full">

                                <ng-template pTemplate="item" let-item>
                                  <div class="flex flex-col py-1.5 border-b border-surface-100 dark:border-surface-800 last:border-0">
                                      <span class="text-sm font-bold tracking-tight text-surface-900 dark:text-surface-0 leading-tight">
                                          {{ item.product_name }}
                                      </span>

                                      <div class="flex items-center gap-2 mt-1">
                                          <span class="text-[10px] uppercase font-black tracking-widest text-surface-400 dark:text-surface-500">
                                              Model:
                                          </span>
                                          <span class="text-[11px] font-medium font-mono bg-surface-100 dark:bg-surface-800/50 px-1.5 py-0.5 rounded text-primary border border-surface-200 dark:border-surface-700">
                                              {{ item.model }}
                                          </span>
                                          <span *ngIf="item.available_stock >= 0" class="ms-auto text-[10px] font-semibold text-orange-500">
                                              {{ item.available_stock }} in stock
                                          </span>
                                      </div>
                                  </div>
                              </ng-template>

                            </p-autocomplete>

                        </div>
                        <div class="w-32 flex flex-col gap-2">
                            <label class="text-xs font-bold text-surface-400 uppercase">Qty</label>
                            <p-inputNumber [(ngModel)]="itemQuantity" [showButtons]="true" [min]="1" inputStyleClass="w-full" />
                        </div>
                        <p-button label="Add" icon="pi pi-plus" (onClick)="addItem()" [disabled]="!selectedProductSpec" />
                    </div>

                    <div class="border border-surface-200 dark:border-surface-800 rounded-xl overflow-x-auto shadow-sm">
                    <table class="w-full text-left">
                      <thead class="bg-surface-50 dark:bg-surface-800 text-xs font-bold text-surface-500 uppercase border-b border-surface-200 dark:border-surface-700">
                          <tr>
                              <th class="p-4">Product</th>
                              <th class="p-4 text-right">Price</th>
                              <th class="p-4 text-center">Qty</th>
                              <th class="p-4 text-right">Discount</th> <th class="p-4 text-right">Net Total</th> <th class="p-4 w-16"></th>
                          </tr>
                      </thead>
                      <tbody class="divide-y divide-surface-100 dark:divide-surface-800">
                          <tr *ngFor="let item of saleItems; let i = index" class="bg-surface-0 dark:bg-surface-900 transition-colors">
                              <td class="p-4 text-sm text-surface-700 dark:text-surface-300">
                                  <div class="font-medium">{{item.product_name}}</div>

                              </td>
                              <td class="p-4 text-sm text-right text-surface-700 dark:text-surface-300">
                                  {{item.unit_price | number}}
                              </td>
                              <td class="p-4 text-sm text-center text-surface-700 dark:text-surface-300">
                                  {{item.quantity}} pc
                              </td>
                              <td class="p-4 text-sm text-right text-amber-600 dark:text-amber-400 font-medium">
                                  <span *ngIf="item.discount > 0">-{{item.discount | number}}</span>
                                  <span *ngIf="!item.discount || item.discount === 0" class="text-surface-300">0</span>
                              </td>
                              <td class="p-4 text-sm text-right font-bold text-primary">
                                  {{ (item.unit_price * item.quantity - (item.discount || 0)) | number }}
                              </td>
                              <td class="p-4">
                                  <div class="flex items-center justify-center gap-1">
                                      <button (click)="openEditDialog(item, i)"
                                          class="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all"
                                          pTooltip="Edit Qty/Item">
                                          <i class="pi pi-pencil text-xs"></i>
                                      </button>

                                      <button (click)="openDiscountDialog(item, i)"
                                          class="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full transition-all"
                                          [class.bg-amber-100]="item.discount > 0"
                                          pTooltip="Apply Discount">
                                          <i class="pi pi-percentage text-xs"></i>
                                      </button>

                                      <button (click)="removeItem(i)"
                                          class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                                          pTooltip="Remove">
                                          <i class="pi pi-trash text-xs"></i>
                                      </button>
                                  </div>
                              </td>
                          </tr>
                          <tr *ngIf="saleItems.length === 0">
                              <td colspan="6" class="p-12 text-center text-surface-400 italic">No items added yet.</td>
                          </tr>
                      </tbody>
                      </table>
                    </div>
                </div>
                <div class="flex justify-between mt-12 pt-6 border-t border-surface-200 dark:border-surface-800">
                    <p-button label="Back" severity="secondary" variant="text" (onClick)="prevStep()" />
                    <p-button label="Next: Payment" icon="pi pi-arrow-right" iconPos="right" (onClick)="nextStep()" [disabled]="saleItems.length === 0" />
                </div>
            </div>

            <div *ngIf="activeStep === 3" class="animate-fade-in">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="flex flex-col gap-6">
                      <div class="flex flex-col gap-2">
                          <label class="text-sm font-semibold text-surface-700 dark:text-surface-200">
                              Payment Method
                          </label>
                          <p-select
                              [options]="paymentMethods"
                              [(ngModel)]="paymentMethod"
                              optionLabel="label"
                              optionValue="value"
                              [checkmark]="true"
                              [showClear]="true"
                              placeholder="Select Method"
                              styleClass="w-full" />
                        </div>
                        <div class="flex items-center gap-1.5">
                            <i class="pi pi-info-circle text-primary text-xs"></i>
                            <small class="text-[11px] text-surface-500 dark:text-surface-400 italic leading-tight">
                                If the customer has not paid yet, please leave this as <strong>Unknown</strong>.
                            </small>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-sm font-semibold text-surface-700 dark:text-surface-200">Deposit Amount (TSh)</label>
                            <p-inputNumber [(ngModel)]="initialDeposit" mode="decimal" class="w-full" inputStyleClass="w-full" />
                        </div>
                        <div class="flex items-center gap-1.5">
                            <i class="pi pi-info-circle text-primary text-xs"></i>
                            <small class="text-[11px] text-surface-500 dark:text-surface-400 italic leading-tight">
                                If the customer has not paid yet, please leave this as <strong>0.00</strong>.
                            </small>
                        </div>
                    </div>

                    <div class="bg-primary-50 dark:bg-primary-900/10 p-8 rounded-2xl border border-primary-100 dark:border-primary-900/30 flex flex-col gap-4 transition-colors">
                        <div class="font-semibold text-xl mb-4">Sales Summary</div>
                        <div class="flex justify-between text-sm">
                            <span class="text-surface-500 dark:text-surface-400">Customer:</span>
                            <span class="font-semibold text-surface-900 dark:text-surface-0">{{ customer.first_name || 'Walk-in' }}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-surface-500 dark:text-surface-400">Quantity:</span>
                            <span class="font-semibold text-surface-900 dark:text-surface-0">{{ totalQuantity }} items</span>
                        </div>
                        <div class="flex justify-between items-center pt-4 border-t-2 border-dashed border-primary-200 dark:border-primary-800 mt-4 text-2xl font-black text-primary">
                            <span>Total:</span>
                            <span>{{ totalAmount | number }} TSh</span>
                        </div>
                    </div>
                </div>
                <div class="flex justify-between mt-12 pt-6 border-t border-surface-200 dark:border-surface-800">
                    <p-button label="Back" severity="secondary" variant="text" (onClick)="prevStep()" />
                    <p-button label="Confirm & Record Sale" severity="success" icon="pi pi-check" (onClick)="submitSale()" />
                </div>
            </div>
    </div>

        <p-dialog [(visible)]="displayEditDialog" header="Edit Sale Item" [modal]="true" [style]="{width: '450px'}" [draggable]="false">
            <div class="flex flex-col gap-4 py-4" *ngIf="editingItem">
                <div class="flex flex-col gap-2">
                    <label class="font-bold text-sm">Product</label>
                    <p-autocomplete [(ngModel)]="editingItem.product_specification" [suggestions]="filteredSpecs"
                        (completeMethod)="searchSpecsManual($event)" optionLabel="product_name" inputStyleClass="w-full" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="font-bold text-sm">Quantity</label>
                    <p-inputNumber [(ngModel)]="editingItem.quantity" [showButtons]="true" [min]="1" styleClass="w-full" />
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancel" severity="secondary" (onClick)="displayEditDialog = false" />
                <p-button label="Update Item" (onClick)="saveEdit()" />
            </ng-template>
        </p-dialog>

        <p-dialog [(visible)]="displayDiscountDialog" header="Apply Discount" [modal]="true" [style]="{width: '450px'}" [draggable]="false">
          <div class="flex flex-col gap-5 py-4" *ngIf="editingItem">
              <div class="bg-surface-50 dark:bg-surface-800/50 p-3 rounded-lg border border-surface-200 dark:border-surface-700">
                  <p class="text-xs font-bold text-surface-500 uppercase tracking-wider mb-1">Product Details</p>
                  <p class="text-sm font-semibold">{{editingItem.product_name}}</p>
                  <p class="text-xs text-primary font-medium">Original Price: {{editingItem.unit_price | number}} TSh</p>
              </div>

              <div class="flex flex-col gap-2">
                  <label class="font-bold text-sm">Selling Price per Unit (TSh)</label>
                  <p-inputNumber
                      [(ngModel)]="discountedUnitPrice"
                      (onInput)="calculateDiscountFromPrice($event.value)"
                      mode="decimal"
                      placeholder="Enter new price..."
                      styleClass="w-full"
                      inputStyleClass="font-bold text-primary" />
              </div>

              <div class="grid grid-cols-2 gap-4 pt-2">
                  <div class="flex flex-col">
                      <span class="text-[10px] font-bold text-surface-400 uppercase">Discount Percentage</span>
                      <span [class]="discountPercent > 15 ? 'text-red-500 font-bold' : 'text-surface-700 dark:text-surface-200 font-semibold'">
                          {{ discountPercent | number:'1.1-1' }}%
                      </span>
                  </div>
                  <div class="flex flex-col">
                      <span class="text-[10px] font-bold text-surface-400 uppercase">Total Saving</span>
                      <span class="text-surface-700 dark:text-surface-200 font-semibold">{{ editingItem.discount | number }} TSh</span>
                  </div>
              </div>

              <div *ngIf="discountPercent > 15" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg flex gap-2 items-center">
                  <i class="pi pi-exclamation-triangle text-red-500"></i>
                  <small class="text-red-600 dark:text-red-400 font-medium">Price is too low! Max allowed discount is 15%.</small>
              </div>
          </div>

          <ng-template pTemplate="footer">
              <p-button label="Cancel" severity="secondary" variant="text" (onClick)="displayDiscountDialog = false" />
              <p-button label="Apply Discount" icon="pi pi-check" (onClick)="saveDiscount()" [disabled]="discountPercent > 15 || discountPercent < 0" />
          </ng-template>
      </p-dialog>
    `
})
export class Sales implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    customer: any = { id: null, first_name: '', last_name: '', phone_number: '' , email: ''};
    saleItems: any[] = [];
    selectedProductSpec: any = null;
    filteredSpecs: any[] = [];
    itemQuantity: number = 1;
    paymentMethod: string = 'Uknown';
    initialDeposit: number = 0;
    salesOutletId: number = 1;

    displayEditDialog: boolean = false;
    displayDiscountDialog: boolean = false;
    editingItem: any = null;
    editingIndex: number = -1;
    discountedUnitPrice: number = 0;
    discountPercent: number = 0;

    activeStep: number = 1;
    nextStep() { if (this.activeStep < 3) this.activeStep++; }
    prevStep() { if (this.activeStep > 1) this.activeStep--; }

    paymentMethods = [
        { label: 'Uknown', value: 'Uknown' },
        { label: 'Cash', value: 'Cash' },
        { label: 'Bank Transfer', value: 'Transfer' },
        { label: 'Mobile Money', value: 'MOMO' }
    ];

    constructor(
        private salesService: SalesService,
        private messageService: MessageService
    ) {}

    ngOnInit() {}
    ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

    searchSpecsManual(event: any) {
        const query = event.query;
        if (query.length > 1) {
            this.salesService.searchProductSpecs(query)
                .pipe(takeUntil(this.destroy$))
                .subscribe(data => this.filteredSpecs = data);
        }
    }

    addItem() {
        if (!this.selectedProductSpec) return;
        const newItem = {
            product_specification_id: this.selectedProductSpec.id,
            product_name: `${this.selectedProductSpec.product_name} - ${this.selectedProductSpec.model}`,
            quantity: this.itemQuantity,
            unit_price: this.selectedProductSpec.discounted_price,
            unit_measure: this.selectedProductSpec.unit_measure,
            available_stock: this.selectedProductSpec.available_stock,
            discount: 0
        };
        this.saleItems.push(newItem);
        this.selectedProductSpec = null;
        this.itemQuantity = 1;
    }

    removeItem(index: number) { this.saleItems.splice(index, 1); }

    get totalAmount(): number {
        return this.saleItems.reduce((acc, item) => {
            const lineGross = item.unit_price * item.quantity;
            const lineNet = lineGross - (item.discount || 0);
            return acc + lineNet;
        }, 0);
    }

    get totalQuantity(): number {
        return this.saleItems.reduce((acc, item) => acc + item.quantity, 0);
    }

    submitSale() {
        const hasCustomerDetails = this.customer.first_name || this.customer.phone_number;
        if (hasCustomerDetails && !this.customer.id) {
            this.salesService.createCustomer(this.customer).subscribe({
                next: (newCustomer) => {
                    this.customer.id = newCustomer.id;
                    this.executeRecordSale();
                },
                error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Customer creation failed' })
            });
        } else {
            this.executeRecordSale();
        }
    }

    private executeRecordSale() {
        const payload = {
            customer_id: this.customer.id ? String(this.customer.id) : null,
            sales_outlet: this.salesOutletId,
            payment_method: this.paymentMethod,
            items: this.saleItems.map(item => ({
                product_specification_id: item.product_specification_id,
                quantity: item.quantity,
                discount: item.discount || 0,
                unit_price: String(item.unit_price),
                unit_measure: item.unit_measure
            })),
            initial_deposit: this.initialDeposit.toFixed(2)
        };

        this.salesService.recordSale(payload).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Sale Recorded' });
                this.resetForm();
            },
            error: (err) => {
                // console.error('Sale Error:', err);

                if (err.error && typeof err.error === 'object') {
                    const errorData = err.error;

                    if (errorData.items) {
                        const itemErrors = Array.isArray(errorData.items)
                            ? errorData.items.join(', ')
                            : errorData.items;

                        this.messageService.add({
                            severity: 'error',
                            summary: 'Inventory Error',
                            detail: itemErrors,
                            sticky: true
                        });
                    }

                    if (errorData.sales_outlet) {
                        const outletErrors = Array.isArray(errorData.sales_outlet)
                            ? errorData.sales_outlet.join(', ')
                            : errorData.sales_outlet;

                        this.messageService.add({
                            severity: 'error',
                            summary: 'Inventory Error',
                            detail: outletErrors,
                            sticky: true
                        });
                    }

                    if (errorData.discount) {
                        const discountErrors = Array.isArray(errorData.discount)
                            ? errorData.discount.join(', ')
                            : errorData.discount;

                        this.messageService.add({
                            severity: 'error',
                            summary: 'Discount Error',
                            detail: discountErrors,
                            sticky: true
                        });
                    }

                    else if (errorData.non_field_errors) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'System Error',
                            detail: errorData.non_field_errors.join(', ')
                        });
                    }
                    else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Sale Failed',
                            detail: 'Please check the form and try again.'
                        });
                    }
                } else {

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Network Error',
                        detail: 'Oops Something went wrong, Plese try again later.'
                    });
                }
            }
        });
    }

    resetForm() {
        this.customer = { id: null, first_name: '', last_name: '', phone_number: '' };
        this.saleItems = [];
        this.initialDeposit = 0.00;
        this.activeStep = 1;
    }

    openEditDialog(item: any, index: number) {
        this.editingIndex = index;
        this.editingItem = { ...item };
        this.displayEditDialog = true;
    }

    openDiscountDialog(item: any, index: number) {
        this.editingIndex = index;
        this.editingItem = { ...item };

        const currentDiscountPerUnit = (this.editingItem.discount || 0) / this.editingItem.quantity;
        this.discountedUnitPrice = this.editingItem.unit_price - currentDiscountPerUnit;
        this.calculateDiscountFromPrice(this.discountedUnitPrice);

        this.displayDiscountDialog = true;
    }

    calculateDiscountFromPrice(newPrice: number | null) {
        const safePrice = newPrice ?? 0;

        if (safePrice <= 0) {
            this.discountPercent = 0;
            this.editingItem.discount = 0;
            return;
        }

        const originalPrice = this.editingItem.unit_price;
        const qty = this.editingItem.quantity;

        const totalDiscount = (originalPrice - safePrice) * qty;
        this.editingItem.discount = totalDiscount;
        this.discountPercent = (totalDiscount / (originalPrice * qty)) * 100;
    }

    saveEdit() {
        this.saleItems[this.editingIndex] = this.editingItem;
        this.displayEditDialog = false;

        this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Item details updated successfully',
            life: 3000
        });
    }

    saveDiscount() {
        if (this.discountPercent > 15) {
            this.messageService.add({
                severity: 'error',
                summary: 'Limit Exceeded',
                detail: 'You cannot sell at this price. It exceeds the 15% discount limit.'
            });
            return;
        }

        this.saleItems[this.editingIndex] = this.editingItem;
        this.displayDiscountDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'New price applied' });

        this.messageService.add({
            severity: 'info',
            summary: 'Applied',
            detail: 'Discount has been applied to the item',
            life: 3000
        });
    }

}
