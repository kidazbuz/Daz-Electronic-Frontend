import { Component, signal, WritableSignal, inject, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, FormGroup, FormArray, Validators, FormControl, ReactiveFormsModule, AbstractControl, NonNullableFormBuilder } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { switchMap, tap, finalize } from 'rxjs/operators';
import { of, Observable, forkJoin } from 'rxjs';

// PrimeNG Imports
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TabsModule } from 'primeng/tabs';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { AccordionModule } from 'primeng/accordion';

import { PurchasingLogics } from '../../../shared/services/purchasing-logics';
import {
  PurchaseOrder, PurchaseOrderItem, StockReception, Supplier, SupplierData,
  ReceptionRecord, ReceptionPayload, AvailableItemOption
} from '../../../shared/interfaces/purchasing-data';
import { GroupPipe } from '../../../shared/pipe/group-pipe';


export function minLengthArray(min: number) {
  return (c: AbstractControl): { [key: string]: any } | null => {
    if (c instanceof FormArray) {
      return c.controls.length >= min ? null : { 'minLengthArray': { requiredLength: min, actualLength: c.controls.length } };
    }
    return null;
  };
}

interface SupplierForm {
  phone: FormControl<string>;
  email: FormControl<string>;
  address: FormControl<string>;
  name: FormControl<string>;
}

@Component({
  selector: 'app-purchasing-order',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AccordionModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    TabsModule,
    DialogModule,
    InputNumberModule,
    ToastModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    TooltipModule,
    FormsModule,
    GroupPipe
  ],

  providers: [MessageService, ConfirmationService, DatePipe],
  template:
  `
  <p-toast />

  <div *ngIf="isLoading" class="flex flex-col items-center justify-center py-20">
    <p-progressSpinner ariaLabel="loading" />
    <p class="mt-4 font-medium text-surface-500">Initializing Purchasing Module...</p>
  </div>

  <div class="font-semibold text-xl mb-4">Manage Purchase Order Details</div>
  <p-tabs value="0">
      <p-tablist>
          <p-tab value="0">Supplier Details</p-tab>
          <p-tab value="1">New Order Line</p-tab>
          <p-tab value="2" *ngIf="purchaseOrders().length > 0">Order Progress</p-tab>
          <p-tab value="3" *ngIf="purchaseOrders().length > 0">Receiving Details</p-tab>
      </p-tablist>
      <p-tabpanels>
          <p-tabpanel value="0">

            <div class="flex justify-end mb-4">
              <p-button label="Create New Supplier" icon="pi pi-plus" size="small" (onClick)="handleCreateSupplierModal()" />
            </div>

            <p-table [value]="suppliersSignal()" [loading]="supplierLoading()" styleClass="p-datatable-sm" [responsiveLayout]="'scroll'">
              <ng-template pTemplate="header">
                <tr>
                  <th class="w-16">#</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Address</th>
                  <th>Created</th>
                  <th class="text-center">Actions</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-item let-i="rowIndex">
                <tr>
                  <td>{{ i + 1 }}</td>
                  <td class="font-bold">{{ item.name }}</td>
                  <td>
                  <div class="flex flex-col text-xs">
                  <span><i class="pi pi-phone mr-1"></i>{{ item.phone }}</span>
                  <span><i class="pi pi-envelope mr-1"></i>{{ item.email }}</span>
                  </div>
                  </td>
                  <td class="max-w-xs truncate">{{ item.address }}</td>
                  <td>{{ item.created_at | date: 'MMM dd, yyyy' }}</td>
                  <td class="text-center">
                  <div class="flex gap-2 justify-center">
                  <p-button icon="pi pi-pencil" severity="info" [rounded]="true" [text]="true" (onClick)="handleEditSupplierModal(item)" pTooltip="Edit" />
                  <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [text]="true" (onClick)="handleDeleteSupplierModal(item.id!)" pTooltip="Delete" />
                  </div>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr><td colspan="6" class="text-center py-10 text-surface-400">No suppliers found.</td></tr>
              </ng-template>
            </p-table>

          </p-tabpanel>
          <p-tabpanel value="1">

            <div *ngIf="mode === 'create-po' || mode === 'edit-po'" class="max-w-5xl mx-auto py-4">
              <form [formGroup]="poForm" (ngSubmit)="onPoSubmit()" class="space-y-8">

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-surface-50 dark:bg-surface-800/50 rounded-lg">
                  <div class="flex flex-col gap-2">
                    <label class="font-semibold">Supplier <span class="text-red-500">*</span></label>
                    <p-select [options]="suppliersSignal()" formControlName="supplier" optionLabel="name" optionValue="id" placeholder="Select a Supplier" class="w-full" />
                    <small class="text-red-500" *ngIf="poForm.get('supplier')?.invalid && poForm.get('supplier')?.touched">Supplier required</small>
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="font-semibold">Expected Delivery <span class="text-red-500">*</span></label>

                    <p-datepicker
                      formControlName="expected_delivery_date"
                      [showIcon]="true"
                      dateFormat="yy-mm-dd"
                      placeholder="Select delivery date"
                      appendTo="body"
                      styleClass="w-full"
                      inputStyleClass="w-full"
                      [ngClass]="{'ng-invalid ng-dirty': poForm.get('expected_delivery_date')?.invalid && poForm.get('expected_delivery_date')?.touched}">
                    </p-datepicker>

                    <small class="text-red-500" *ngIf="poForm.get('expected_delivery_date')?.invalid && poForm.get('expected_delivery_date')?.touched">
                      <ng-container *ngIf="poForm.get('expected_delivery_date')?.hasError('required')">
                        Delivery date is required.
                      </ng-container>

                      <ng-container *ngIf="poForm.get('expected_delivery_date')?.hasError('server')">
                        {{ poForm.get('expected_delivery_date')?.getError('server') }}
                      </ng-container>
                    </small>
                  </div>
                </div>

                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <div class="font-semibold text-xl mb-4">Line Items</div>
                    <p-button label="Add Item" icon="pi pi-plus" size="small" severity="secondary" (onClick)="addItem()" [disabled]="isSubmitting" />
                  </div>

                <div class="border border-surface-200 dark:border-surface-700 rounded-lg">
                  <table class="w-full text-sm">
                  <thead class="bg-surface-100 dark:bg-surface-800">
                  <tr>
                  <th class="p-3 text-left">Product</th>
                  <th class="p-3 text-left w-32">Qty</th>
                  <th class="p-3 text-left w-40">Unit Cost</th>
                  <th class="p-3 text-left w-32">Total</th>
                  <th class="p-3 text-center w-16"></th>
                  </tr>
                  </thead>
                  <tbody formArrayName="items">
                    <tr *ngFor="let itemGroup of poItems.controls; let i = index" [formGroupName]="i" class="border-t border-surface-200 dark:border-surface-700">
                      <td class="p-2">
                      <p-select [options]="products" formControlName="product" optionLabel="name" optionValue="id" [filter]="true" placeholder="Product" class="w-full p-select-sm" />
                      </td>
                      <td class="p-2">
                      <input type="number" formControlName="quantity_ordered" class="p-inputtext p-component w-full" />
                      </td>
                      <td class="p-2">
                      <input type="number" formControlName="unit_cost" class="p-inputtext p-component w-full" />
                      </td>
                      <td class="p-2 font-mono font-bold">
                      {{ (itemGroup.get('quantity_ordered')?.value * itemGroup.get('unit_cost')?.value) | number:'1.2-2' }}
                      </td>
                      <td class="p-2 text-center">
                      <p-button icon="pi pi-times" severity="danger" [text]="true" (onClick)="removeItem(i)" />
                      </td>
                    </tr>
                  </tbody>
                  </table>
                </div>
                </div>

              <div class="flex justify-end pt-4">
              <p-button type="submit" [label]="isSubmitting ? 'Saving...' : 'Submit Purchase Order'" icon="pi pi-check" [loading]="isSubmitting" size="large" />
              </div>
              </form>
            </div>

          </p-tabpanel>
          <p-tabpanel value="2">

            <div class="my-4 space-y-8">
              @for (group of purchaseOrders() | group; track group.group) {

                <div class="relative flex items-center py-2 mt-10">
                  <div class="flex-grow border-t border-surface-200 dark:border-surface-700"></div>
                  <span class="flex-shrink mx-4 text-sm font-semibold titlecase tracking-wider text-surface-500">
                    {{ group.group }}
                  </span>
                  <div class="flex-grow border-t border-surface-200 dark:border-surface-700"></div>
                </div>

                <p-accordion class="w-full custom-po-accordion">
                  @for (po of group.data; track po.id) {

                    <p-accordion-panel [value]="po.id">

                      <p-accordion-header>
                        <div class="flex flex-wrap items-center w-full gap-4 text-sm md:text-base">
                          <div class="flex-1 text-left">
                            <span class="text-surface-500 mr-2">Order:</span>
                            <span class="font-bold text-primary">{{ po.po_number }}</span>
                          </div>
                          <div class="flex-[2] text-left">
                            <span class="text-surface-500 mr-2">Supplier:</span>
                            <span class="font-semibold">{{ po.supplier_name }}</span>
                          </div>
                          <div class="flex-1 text-right pr-4">
                            <span class="hidden md:inline text-surface-400 text-xs uppercase mr-2">Due:</span>
                            <span class="font-mono">{{ po.po_date | date:'MMM d, y' }}</span>
                          </div>
                        </div>
                      </p-accordion-header>

                      <p-accordion-content>
                        <div class="overflow-x-auto rounded-lg border border-surface-200 dark:border-surface-700">
                          <table class="w-full text-sm text-left">
                            <thead class="bg-surface-50 dark:bg-surface-900 text-surface-700 dark:text-surface-0 uppercase text-xs">
                              <tr>
                                <th class="p-4">Item ID</th>
                                <th class="p-4 min-w-[300px]">Product Name</th>
                                <th class="p-4 text-center">Qty</th>
                                <th class="p-4 text-center">Unit Cost</th>
                                <th class="p-4 text-center">Total</th>
                                <th class="p-4 text-center">Received</th>
                                <th class="p-4 text-center">Actions</th>
                              </tr>
                            </thead>
                            <tbody class="divide-y divide-surface-200 dark:divide-surface-700">
                              @for (item of po.items; track item.id) {
                                <tr class="hover:bg-surface-50/50 dark:hover:bg-surface-800/50 transition-colors">
                                  <td class="p-4 text-surface-500">#00{{ item.id }}</td>

                                  <td class="p-4 text-start font-mono">
                                    {{ item.product_name }}

                                  </td>

                                  <td class="p-4 text-center font-mono">
                                    {{ item.quantity_ordered }}

                                  </td>

                                  <td class="p-4 text-center font-mono">
                                    {{ item.unit_cost | currency: 'TZS': 'symbol' }}
                                  </td>

                                  <td class="p-4 text-center font-bold text-primary">
                                    {{ (item.quantity_ordered * (item.unit_cost)) | currency: 'TZS': 'symbol' }}
                                  </td>

                                  <td class="p-4 text-center">
                                    <span class="px-2 py-1 rounded bg-surface-100 dark:bg-surface-800 font-semibold">
                                      {{ item.quantity_received_sum ?? 0 }}
                                    </span>
                                  </td>

                                  <td class="p-4 text-center">
                                    <p-button label="Receptions"
                                              icon="pi pi-history"
                                              [outlined]="true"
                                              size="small"
                                              severity="secondary"
                                              (onClick)="$event.stopPropagation(); openAccordionPanel('item-reception-' + item.id)" />
                                  </td>
                                </tr>
                              }
                            </tbody>
                            <tfoot class="bg-surface-50 dark:bg-surface-900 font-bold">
                              <tr>
                                <td colspan="4" class="p-4 text-right">Total Order Amount:</td>
                                <td colspan="3" class="p-4 text-primary text-lg">
                                  {{ po.order_total | currency: 'TZS': 'symbol'}}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </p-accordion-content>

                    </p-accordion-panel>

                  } @empty {
                    <div class="p-8 text-center bg-surface-50 rounded-xl border-2 border-dashed border-surface-200">
                      <p class="text-surface-500 italic">No purchase orders in this group.</p>
                    </div>
                  }
                </p-accordion>

              } @empty {
                <div class="flex flex-col items-center justify-center p-20 bg-surface-50 rounded-2xl border border-surface-200">
                  <i class="pi pi-inbox text-5xl text-surface-300 mb-4"></i>
                  <p class="text-surface-500 font-medium">No purchase orders to display.</p>
                </div>
              }
            </div>

          </p-tabpanel>
          <p-tabpanel value="3">

            <div class="p-4 bg-white dark:bg-surface-900 rounded-xl shadow-sm border border-surface-200 dark:border-surface-700">

              <div class="flex justify-end mb-4">
                <p-button
                  label="New Record"
                  icon="pi pi-plus"
                  severity="primary"
                  size="small"
                  (onClick)="openModal()" /> </div>

              <div class="overflow-x-auto rounded-lg border border-surface-200 dark:border-surface-700">
                <table class="w-full text-sm text-left border-collapse">
                  <thead class="bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-200 uppercase text-xs font-bold">
                    <tr>
                      <th class="p-4 w-12 text-center">#</th>
                      <th class="p-4">PO Item</th>
                      <th class="p-4 text-center">Received Qty</th>
                      <th class="p-4 text-center">Decayed Qty</th>
                      <th class="p-4 text-center">Date</th>
                      <th class="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-surface-200 dark:divide-surface-700">
                    @for (record of receptions(); track record.id) {
                      <tr class="hover:bg-surface-50/50 transition-colors">
                        <td class="p-4 text-center font-mono text-surface-500">{{ $index + 1 }}</td>
                        <td class="p-4 font-medium">{{ record.product_name }}</td>
                        <td class="p-4 text-center">
                          <span class="px-2 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-bold">
                            {{ record.quantity_received }}
                          </span>
                        </td>
                        <td class="p-4 text-center text-red-500 font-bold">{{ record.decayed_products }}</td>
                        <td class="p-4 text-center text-surface-500 italic">
                          {{ record.reception_date | date: 'MMM dd, yyyy' }}
                        </td>
                        <td class="p-4 text-center">
                          <div class="flex justify-center gap-2">
                            <p-button icon="pi pi-pencil" [text]="true" severity="info" (onClick)="openModal(record)" />
                            <p-button icon="pi pi-trash" [text]="true" severity="danger" (onClick)="deleteReception(record.id)" />
                          </div>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="6" class="p-10 text-center text-surface-400">
                          <i class="pi pi-info-circle mr-2"></i> No reception records found.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              </div>

          </p-tabpanel>
      </p-tabpanels>
  </p-tabs>

  <p-dialog
  [(visible)]="showReceptionModal"
  [header]="isEditMode() ? 'Edit Reception' : 'New Reception Record'"
  [modal]="true"
  [style]="{ width: '450px' }"
  [draggable]="false"
  (onHide)="closeModal()">

  <div class="p-fluid flex flex-col gap-4 mt-2">

    @if (fieldErrors()['non_field_errors']) {
      <div class="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
        @for (error of fieldErrors()['non_field_errors']; track $index) {
          <div>{{ error }}</div>
        }
      </div>
    }

    <div class="flex flex-col gap-2">
      <label class="font-bold text-sm">Purchase order item</label>
      <p-select
        [options]="availableItems()"
        [(ngModel)]="currentReception().purchase_order_item"
        optionLabel="display"
        optionValue="id"
        placeholder="Select PO Item"
        [filter]="true"
        appendTo="body"
        [styleClass]="fieldErrors()['purchase_order_item'] ? 'ng-invalid ng-dirty' : ''" />
        @if (fieldErrors()['purchase_order_item']) {
        <small class="text-red-500">{{ fieldErrors()['purchase_order_item']?.[0] }}</small>
      }
    </div>

    <div class="flex flex-col gap-2">
      <label class="font-bold text-sm">Quantity received</label>
      <p-inputnumber
        [(ngModel)]="currentReception().quantity_received"
        [min]="1"
        placeholder="Enter quantity"
        [styleClass]="fieldErrors()['quantity_received'] ? 'ng-invalid ng-dirty' : ''" />
        @if (fieldErrors()['quantity_received']) {
      <small class="text-red-500">{{ fieldErrors()['quantity_received']?.[0] }}</small>
    }
    </div>

    <div class="flex flex-col gap-2">
      <label class="font-bold text-sm">Decayed products</label>
      <p-inputnumber
        [(ngModel)]="currentReception().decayed_products"
        [min]="0"
        placeholder="0"
        [styleClass]="fieldErrors()['decayed_products'] ? 'ng-invalid ng-dirty' : ''" />
        @if (fieldErrors()['decayed_products']) {
        <small class="text-red-500">{{ fieldErrors()['decayed_products']?.[0] }}</small>
      }
    </div>
  </div>

  <ng-template pTemplate="footer">
    <div class="flex justify-end gap-2">
      <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="closeModal()" />
      <p-button [label]="isEditMode() ? 'Save Changes' : 'Create Record'" severity="success" (onClick)="saveReception()" />
    </div>
  </ng-template>
  </p-dialog>

  <p-dialog [header]="supplierModalMode === 'create' ? 'New Supplier' : 'Edit Supplier'" [(visible)]="showSupplierModal" [modal]="true" [style]="{width: '450px'}" class="p-fluid">
    <form [formGroup]="supplierForm" class="space-y-4 pt-4">
    <div class="flex flex-col gap-2">
    <label for="name">Full Name</label>
    <input pInputText id="name" formControlName="name" />
    </div>
    <div class="flex flex-col gap-2">
    <label for="phone">Phone</label>
    <input pInputText id="phone" formControlName="phone" />
    </div>
    <div class="flex flex-col gap-2">
    <label for="email">Email</label>
    <input pInputText id="email" formControlName="email" />
    </div>
    <div class="flex flex-col gap-2">
    <label for="address">Address</label>
    <textarea pInputTextarea id="address" formControlName="address" rows="3"></textarea>
    </div>
    </form>
  <ng-template pTemplate="footer">
  <p-button label="Cancel" icon="pi pi-times" [text]="true" (onClick)="closeModal()" />
  <p-button label="Save Supplier" icon="pi pi-check" (onClick)="onAddOrEditSupplier()" [loading]="supplierLoading()" />
  </ng-template>
  </p-dialog>

  <p-confirmDialog />


  `
  ,
  // styleUrl: './purchasing.scss',
})


export class PurchasingOrder implements OnInit {
  // --- Component Metadata ---
  heading = '';
  subheading = '';
  icon = 'pi pi-shopping-cart text-info';
  currentJustify = 'start';

  // --- State Variables ---
  poId: number | null = null;
  mode: 'create-po' | 'edit-po' | 'receive-stock' = 'create-po';
  isLoading = false;
  isSubmitting = false;

  // --- Modal Visibility Signals (PrimeNG) ---
  showSupplierModal = signal(false);
  showReceptionModal = signal(false);

  supplierModalMode: 'create' | 'edit' = 'create';
  currentSupplierId: number | null = null;
  supplierLoading = signal(false);
  supplierMessage = signal<string | null>(null);

  public handlePreventToggle() { }

  // --- Form & Data Holders ---
  poForm!: FormGroup;
  srForm!: FormGroup;
  currentPo: PurchaseOrder | null = null;
  products: any[] = [];

  suppliersSignal: WritableSignal<SupplierData[]> = signal([]);
  purchaseOrders: WritableSignal<any[]> = signal([]);
  receptions: WritableSignal<ReceptionRecord[]> = signal([]);
  availableItems: WritableSignal<AvailableItemOption[]> = signal([]);
  isEditMode: WritableSignal<boolean> = signal(false);
  fieldErrors: WritableSignal<Record<string, string[] | undefined>> = signal({});

  currentReception: WritableSignal<Partial<ReceptionRecord>> = signal({
    purchase_order_item: undefined,
    quantity_received: undefined,
    decayed_products: 0,
  });

  activePanel: WritableSignal<string | null> = signal(null);

  private baseUrl = 'http://127.0.0.1:8000/api/';
  private formBuilder = inject(NonNullableFormBuilder);
  http = inject(HttpClient);

  // PrimeNG Services
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  constructor(
    private fb: FormBuilder,
    private purchasingService: PurchasingLogics,
    private route: ActivatedRoute,
    public router: Router,
  ) { }

  supplierForm: FormGroup<SupplierForm> = this.formBuilder.group({
    phone: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    name: ['', [Validators.required]],
    address: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.loadRouteData();
    this.loadSuppliers();
    this.loadPurchaseOrders();
    this.loadReceptions();
  }

  loadReceptions(): void {
    this.purchasingService.getAllReceptions().subscribe({
      next: (data) => this.receptions.set(data),
      error: (err) => console.error('Failed to load receptions', err)
    });
  }

  // Adapted for PrimeNG Dialog
  openModal(record?: ReceptionRecord): void {
    this.fieldErrors.set({});
    if (record) {
      this.isEditMode.set(true);
      this.currentReception.set({ ...record });
    } else {
      this.isEditMode.set(false);
      this.currentReception.set({
        purchase_order_item: undefined,
        quantity_received: undefined,
        decayed_products: 0,
      });
    }
    this.showReceptionModal.set(true);
  }

  closeModal(): void {
    this.fieldErrors.set({});
    this.showReceptionModal.set(false);
    this.showSupplierModal.set(false);
  }

  saveReception(): void {
    const record = this.currentReception();
    this.fieldErrors.set({});

    if (!record.purchase_order_item || !record.quantity_received) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Please select a PO Item and enter Quantity.' });
      return;
    }

    const payload: ReceptionPayload = {
      purchase_order_item: record.purchase_order_item as number,
      quantity_received: record.quantity_received as number,
      decayed_products: record.decayed_products as number,
    };

    const operation$ = this.isEditMode()
      ? this.purchasingService.updateReception(record.id as number, payload)
      : this.purchasingService.createReception(payload);

    operation$.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Reception saved' });
        this.loadReceptions();
        this.loadPurchaseOrders();
        this.closeModal();
      },
      error: (err) => {
        if (err.status === 400 && err.error) {
          this.fieldErrors.set(err.error);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
        }
      }
    });
  }

  deleteReception(id: number): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this reception record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.purchasingService.deleteReception(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Record removed' });
            this.loadReceptions();
            this.loadPurchaseOrders();
          },
          error: (err) => console.error('Failed to delete reception', err)
        });
      }
    });
  }

  openAccordionPanel(panelId: string): void {
    const currentPanel = this.activePanel();
    this.activePanel.set(currentPanel === panelId ? null : panelId);
  }

  loadSuppliers(): void {
    this.supplierLoading.set(true);
    this.purchasingService.getSuppliers().pipe(
      finalize(() => this.supplierLoading.set(false))
    ).subscribe({
      next: (data: SupplierData[]) => this.suppliersSignal.set(data),
      error: (err) => {
        this.supplierMessage.set('Failed to load suppliers.');
        this.messageService.add({ severity: 'error', detail: 'Failed to load suppliers' });
      }
    });
  }

  loadPurchaseOrders(): void {
    this.purchasingService.getPurchaseOrders().subscribe({
      next: (data: any[]) => {
        this.purchaseOrders.set(data);
        const flatItems = this.extractAvailableItems(data);
        this.availableItems.set(flatItems);
      },
      error: (err) => console.error('Failed to load Purchase Orders:', err)
    });
  }

  extractAvailableItems(orders: PurchaseOrder[]): AvailableItemOption[] {
  const availableList: AvailableItemOption[] = [];

  orders.forEach(po => {
    po.items.forEach(item => {
      // Fix TS18048: Treat undefined as 0 for the comparison and calculation
      const receivedSum = item.quantity_received_sum ?? 0;

      if (receivedSum < item.quantity_ordered) {
        availableList.push({
          // Fix TS2322: Assert that id and po_number are present
          id: item.id!,
          po_number: po.po_number!,
          display: `${po.po_number} - ${item.product_name} (Qty Left: ${item.quantity_ordered - receivedSum})`
        });
      }
    });
  });

  return availableList;
}

  loadRouteData(): void {
    this.isLoading = true;
    this.route.paramMap.pipe(
      switchMap(params => {
        this.poId = Number(params.get('id'));
        const urlSegments = this.router.url.split('/');

        if (isNaN(this.poId) || this.poId === 0) {
          this.mode = 'create-po';
          this.setMetadata('Manage Purchase Order Details', 'New procurement request.');
          this.initializePoForm();
          return of(null);
        } else if (urlSegments.includes('receive')) {
          this.mode = 'receive-stock';
          this.setMetadata('Record Stock Reception', `Entry for PO #${this.poId}.`);
          return this.purchasingService.getPurchaseOrder(this.poId);
        } else {
          this.mode = 'edit-po';
          this.setMetadata('Edit Purchase Order', `Modify PO #${this.poId} details.`);
          return this.purchasingService.getPurchaseOrder(this.poId);
        }
      }),
      switchMap(poData => {
        if (poData) this.currentPo = poData;
        return this.loadInitialLookupData();
      })
    ).subscribe({
      next: () => {
        if (this.currentPo) {
          if (this.mode === 'edit-po') this.initializePoForm(this.currentPo);
          else if (this.mode === 'receive-stock') this.initializeSrForm(this.currentPo);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', detail: 'Error loading route data' });
      }
    });
  }

  setMetadata(heading: string, subheading: string): void {
    this.heading = heading;
    this.subheading = subheading;
  }

  loadInitialLookupData(): Observable<[any[]]> {
    return forkJoin([this.purchasingService.getProducts()]).pipe(
      tap(([productsData]) => this.products = productsData),
      switchMap(([productsData]) => of([productsData] as [any[]]))
    );
  }

  handleCreateSupplierModal(): void {
    this.supplierModalMode = 'create';
    this.supplierForm.reset();
    this.supplierMessage.set(null);
    this.showSupplierModal.set(true);
  }

  handleEditSupplierModal(supplier: Supplier): void {
    this.supplierModalMode = 'edit';
    this.currentSupplierId = supplier.id!;
    this.supplierMessage.set(null);
    this.supplierForm.patchValue({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
    });
    this.showSupplierModal.set(true);
  }

  handleDeleteSupplierModal(id: number): void {
    this.confirmationService.confirm({
      message: 'Delete this supplier? This cannot be undone.',
      header: 'Confirm Deletion',
      icon: 'pi pi-trash',
      accept: () => {
        this.currentSupplierId = id;
        this.onDeleteSupplier();
      }
    });
  }

  onAddOrEditSupplier(): void {
    this.supplierMessage.set(null);
    this.supplierLoading.set(true);

    if (this.supplierForm.invalid) {
      this.supplierForm.markAllAsTouched();
      this.supplierLoading.set(false);
      return;
    }

    const formValue = this.supplierForm.getRawValue();
    let apiCall: Observable<Supplier>;

    if (this.supplierModalMode === 'create') {
      apiCall = this.purchasingService.createSupplier(formValue as Supplier);
    } else {
      const updatePayload: Supplier = { id: this.currentSupplierId!, ...formValue };
      apiCall = this.purchasingService.updateSupplier(updatePayload);
    }

    apiCall.pipe(finalize(() => this.supplierLoading.set(false))).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Supplier updated' });
        this.showSupplierModal.set(false);
        this.loadSuppliers();
      },
      error: err => {
        const errors = err?.error;
        if (errors && typeof errors === 'object') {
          Object.keys(errors).forEach(field => {
            const control = this.supplierForm.get(field);
            if (control) control.setErrors({ serverError: errors[field][0] });
          });
        }
      }
    });
  }

  onDeleteSupplier(): void {
    if (!this.currentSupplierId) return;
    this.supplierLoading.set(true);
    this.purchasingService.deleteSupplier(this.currentSupplierId!).pipe(
      finalize(() => this.supplierLoading.set(false))
    ).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', detail: 'Supplier deleted' });
        this.loadSuppliers();
      },
      error: (err) => this.messageService.add({ severity: 'error', detail: 'Delete failed: linked data exists' })
    });
  }

  initializePoForm(po?: PurchaseOrder): void {
    this.poForm = this.fb.group({
      id: [po?.id || null],
      supplier: [po?.supplier || null, Validators.required],
      expected_delivery_date: [po?.expected_delivery_date || null, Validators.required],
      po_status: [po?.po_status || 'DRAFT'],
      items: this.fb.array(po?.items?.map(item => this.createItemFormGroup(item)) || [], minLengthArray(1))
    });
  }

  initializeSrForm(po: PurchaseOrder): void {
    this.srForm = this.fb.group({
      receptions: this.fb.array(po.items.map(item => this.createReceptionFormGroup(item)))
    });
  }

  get poItems(): FormArray { return this.poForm?.get('items') as FormArray; }

  createItemFormGroup(item?: PurchaseOrderItem): FormGroup {
    return this.fb.group({
      id: [item ? item.id : null],
      product: [item ? item.product : null, Validators.required],
      quantity_ordered: [item ? item.quantity_ordered : 1, [Validators.required, Validators.min(1)]],
      unit_cost: [item ? item.unit_cost : 0.00, [Validators.required, Validators.min(0)]],
      quantity_received_sum: [item?.quantity_received_sum || 0],
      product_name: [item?.product_name || '']
    });
  }

  addItem(): void { this.poItems.push(this.createItemFormGroup()); }
  removeItem(index: number): void { this.poItems.removeAt(index); }
  get srItems(): FormArray { return this.srForm?.get('receptions') as FormArray; }

  createReceptionFormGroup(item: PurchaseOrderItem): FormGroup {
    const maxReceivable = item.quantity_ordered - (item.quantity_received_sum || 0);
    return this.fb.group({
      purchase_order_item: [item.id, Validators.required],
      product_name: [item.product_name],
      quantity_ordered: [item.quantity_ordered],
      quantity_received_sum: [item.quantity_received_sum],
      max_receivable: [maxReceivable],
      quantity_received: [0, [Validators.required, Validators.min(1), Validators.max(maxReceivable)]],
      decayed_products: [0, [Validators.min(0)]],
    });
  }

  onPoSubmit(): void {
    if (this.poForm.invalid || this.isSubmitting) {
      this.poForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const payload: PurchaseOrder = this.poForm.value;
    const apiCall = this.mode === 'create-po'
      ? this.purchasingService.createPurchaseOrder(payload)
      : this.purchasingService.updatePurchaseOrder(payload);

    apiCall.subscribe({
      next: (response: PurchaseOrder) => {
        this.isSubmitting = false;
        this.messageService.add({ severity: 'success', summary: 'PO Saved' });
        // this.router.navigate(['/purchasing', 'edit', response.id]);
      },
      error: (error: any) => {
        this.isSubmitting = false;
        if (error.status === 400 && error.error) {
          for (const fieldName in error.error) {
            const formControl = this.poForm.get(fieldName);
            if (formControl) formControl.setErrors({ 'server': error.error[fieldName][0] });
          }
        }
      }
    });
  }

  onSrSubmit(): void {
    if (this.srForm.invalid || this.isSubmitting) {
      this.srForm.markAllAsTouched();
      return;
    }
    const receptionsToSubmit: StockReception[] = this.srItems.controls
      .map(control => control.value)
      .filter(val => val.quantity_received > 0);

    if (receptionsToSubmit.length === 0) return;
    this.isSubmitting = true;
    let completed = 0;
    receptionsToSubmit.forEach(reception => {
      this.purchasingService.createStockReception(reception).subscribe({
        next: () => {
          completed++;
          if (completed === receptionsToSubmit.length) {
            this.isSubmitting = false;
            this.messageService.add({ severity: 'success', detail: 'Inventory Updated' });
            // this.router.navigate(['/purchasing', 'edit', this.poId]);
          }
        },
        error: () => this.isSubmitting = false
      });
    });
  }
}
