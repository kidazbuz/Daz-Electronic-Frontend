import { Component, OnInit, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

// PrimeNG Modules
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CheckboxModule } from 'primeng/checkbox';
import { AvatarModule } from 'primeng/avatar';
import { MessageService } from 'primeng/api';

import { Master } from '../../../shared/services/master';
import { ExpensePayload, ICategory, IPayee, IExpense } from '../../../shared/interfaces/expenses';
import { LocationResponse } from '../../../shared/interfaces/user';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, AvatarModule,
    TabsModule, SelectButtonModule, SelectModule, DialogModule, InputNumberModule,
    InputTextModule, TextareaModule, CheckboxModule, ToastModule, TagModule,
    ToolbarModule, TableModule, ButtonModule, IconFieldModule, InputIconModule
  ],
  template: `
    <p-toast />

    <p-toolbar styleClass="mb-6">
        <ng-template #start>
            <p-button label="New Expense" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
        </ng-template>

        <ng-template #end>
            <p-button label="Export" icon="pi pi-upload" severity="secondary" />
        </ng-template>
    </p-toolbar>

    <p-table
        #dt
        [value]="expenses()"
        [rows]="10"
        [paginator]="true"
        [globalFilterFields]="['description', 'category.name', 'payee.name', 'payment_method']"
        [tableStyle]="{ 'min-width': '75rem' }"
        [(selection)]="selectedExpenses"
        [rowHover]="true"
        dataKey="id"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Expenses"
        [showCurrentPageReport]="true"
        [loading]="isLoading()"
    >
      <ng-template #caption>
          <div class="flex items-center justify-between">
              <div class="font-semibold text-xl">Manage Daily Expenses</div>
              <p-iconfield>
                  <p-inputicon styleClass="pi pi-search" />
                  <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search..." />
              </p-iconfield>
          </div>
      </ng-template>

        <ng-template #header>
            <tr>
                <th style="width: 3rem"><p-tableHeaderCheckbox /></th>
                <th pSortableColumn="expense_date">Date <p-sortIcon field="expense_date" /></th>
                <th pSortableColumn="payee.name">Payee <p-sortIcon field="payee.name" /></th>
                <th pSortableColumn="amount">Amount <p-sortIcon field="amount" /></th>
                <th>Category</th>
                <th>Method</th>
                <th style="width: 8rem"></th>
            </tr>
        </ng-template>

        <ng-template #body let-expense>
            <tr>
                <td><p-tableCheckbox [value]="expense" /></td>
                <td>{{ expense.expense_date | date:'medium' }}</td>
                <td style="font-weight: 600;">{{ (expense.payee?.name | titlecase) || 'N/A' }}</td>
                <td class="text-green-600 font-bold">
                    {{ expense.amount | currency:'TZS ':'symbol':'1.0-2' }}
                </td>
                <td>
                    <p-tag [value]="expense.category.name" severity="info" />
                </td>
                <td>
                    <span class="text-sm italic">{{ expense.payment_method }}</span>
                </td>
                <td>
                    <p-button icon="pi pi-eye" class="mr-2" [rounded]="true" [outlined]="true" (click)="viewDetails(expense)" />
                    <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" />
                </td>
            </tr>
        </ng-template>
    </p-table>

    <p-dialog [(visible)]="visible" header="Record Expense" [modal]="true" [style]="{width: '600px'}" class="p-fluid">
        <form [formGroup]="expenseForm" (ngSubmit)="saveExpense()" class="flex flex-col gap-5 text-color">

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <label class="font-bold text-sm ml-1">Amount (TZS)</label>
              <p-inputNumber formControlName="amount" mode="decimal" [minFractionDigits]="2" placeholder="0.00" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="font-bold text-sm ml-1">Payment Method</label>
              <p-select [options]="['Cash', 'Mobile Money', 'Bank Transfer']" formControlName="payment_method" />
            </div>
          </div>

          <div class="p-4 border border-surface rounded-xl bg-surface-50 dark:bg-surface-900 flex flex-col gap-3">
            <div class="flex justify-between items-center px-1">
              <span class="font-bold">Category</span>
              <p-selectButton [options]="[{label: 'Select', value: false}, {label: 'New', value: true}]"
                              (onChange)="isNewCategory.set($event.value)"
                              [ngModelOptions]="{standalone: true}"
                              [ngModel]="isNewCategory()" />
            </div>

            <div *ngIf="!isNewCategory()" class="flex flex-col gap-1">
              <p-select [options]="categories()" optionLabel="name" optionValue="id" formControlName="category_id" placeholder="Select Category" [filter]="true" #cSel></p-select>
              <p *ngIf="cSel.selectedOption?.description" class="mt-2 text-xs italic opacity-70 px-2 border-l-2 border-primary-500">
                {{cSel.selectedOption.description}}
              </p>
            </div>

            <div *ngIf="isNewCategory()" formGroupName="new_category" class="flex flex-col gap-3">
              <div class="flex flex-col gap-1">
                <input pInputText formControlName="name" placeholder="New Category Name *" />
              </div>
              <div class="flex flex-col gap-1">
                <textarea pTextarea formControlName="description" rows="2" placeholder="Optional Description"></textarea>
              </div>
            </div>
          </div>

          <div class="p-4 border border-surface rounded-xl bg-surface-50 dark:bg-surface-900 flex flex-col gap-3">
            <div class="flex justify-between items-center px-1">
              <span class="font-bold">Payee</span>
              <p-selectButton [options]="[{label: 'Select', value: false}, {label: 'New', value: true}]"
                              (onChange)="isNewPayee.set($event.value)"
                              [ngModel]="isNewPayee()"
                              [ngModelOptions]="{standalone: true}" />
            </div>

            <div *ngIf="!isNewPayee()" class="flex flex-col gap-3">
              <p-select [options]="payees()" optionLabel="name" optionValue="id" formControlName="payee_id" placeholder="Select Payee" [filter]="true" #pSel></p-select>

              <div *ngIf="pSel.selectedOption" class="mt-3 p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg flex justify-between items-center animate-in fade-in duration-300">
                  <div class="text-xs flex flex-col gap-1">
                    <span class="block font-bold titlecase tracking-wider opacity-60 text-[10px]">Current Address</span>

                    <div class="font-medium leading-relaxed">
                      <span class="text-primary-700 dark:text-primary-300">
                        {{ pSel.selectedOption.address?.region }}, {{ pSel.selectedOption.address?.district }}
                      </span>

                      <div class="mt-0.5 opacity-90">
                        {{ pSel.selectedOption.address?.ward }}
                        <span *ngIf="pSel.selectedOption.address?.street">
                          • {{ pSel.selectedOption.address?.street }}
                        </span>
                        <span *ngIf="pSel.selectedOption.address?.street_prominent_name" class="italic">
                          ({{ pSel.selectedOption.address?.street_prominent_name }})
                        </span>
                      </div>

                      <div *ngIf="pSel.selectedOption.address?.post_code" class="text-[10px] font-mono mt-1 opacity-70">
                        Postal Code: {{ pSel.selectedOption.address?.post_code }}
                      </div>
                    </div>
                  </div>

                  <p-button label="Shift Address?"
                            [text]="true"
                            size="small"
                            icon="pi pi-map"
                            (onClick)="enableAddressEdit(pSel.selectedOption)"
                            styleClass="ml-2 whitespace-nowrap" />
                </div>
            </div>

            <div *ngIf="isNewPayee()" formGroupName="new_payee" class="flex flex-col gap-3">
              <div class="flex flex-col gap-1">
                <label class="font-semibold text-sm ml-1">Payee Name</label>
                <input pInputText formControlName="name" placeholder="Name *" [readonly]="isEditingExistingAddress()" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="font-semibold text-sm ml-1">Phone</label>
                <input pInputText formControlName="phone_number" placeholder="Phone Number" />
              </div>

              <div class="flex items-center gap-2 ml-1">
                <p-checkbox [binary]="true" formControlName="include_address" (onChange)="hasAddress.set($event.checked)" id="addr_check"></p-checkbox>
                <label for="addr_check" class="font-semibold text-sm cursor-pointer">Include Address Details</label>
              </div>

              <div *ngIf="hasAddress()" formGroupName="address" class="grid grid-cols-2 gap-3 mt-2">

                <div class="flex flex-col gap-1">
                  <label class="font-semibold text-sm ml-1">Region</label>
                  <p-select [options]="regions()" optionLabel="name" optionValue="name"
                            (onChange)="onRegionChange($event)" formControlName="region"
                            placeholder="Select Region" [filter]="true"></p-select>
                </div>

                <div class="flex flex-col gap-1">
                  <label class="font-semibold text-sm ml-1">District</label>
                  <p-select [options]="districts()" optionLabel="name" optionValue="name"
                            (onChange)="onDistrictChange($event)" formControlName="district"
                            placeholder="Select District" [filter]="true"></p-select>
                </div>

                <div class="flex flex-col gap-1">
                  <label class="font-semibold text-sm ml-1">Ward</label>
                  <p-select [options]="wards()" optionLabel="name" optionValue="name"
                            (onChange)="onWardChange($event)" formControlName="ward"
                            placeholder="Select Ward" [filter]="true"></p-select>
                </div>

                <div class="flex flex-col gap-1">
                  <div class="flex justify-between items-center px-1">
                    <label class="font-semibold text-sm">Street <span class="text-red-500">*</span></label>
                    <span *ngIf="isManualStreet()" class="text-[9px] bg-amber-100 text-amber-700 px-1.5 rounded-full font-bold uppercase">Manual</span>
                  </div>

                  <p-select *ngIf="!isManualStreet(); else manualStreetInput"
                            [options]="streets()" optionLabel="name" optionValue="name"
                            formControlName="street" placeholder="Select Street"
                            [filter]="true"></p-select>

                  <ng-template #manualStreetInput>
                    <div class="flex flex-col gap-1">
                      <input pInputText formControlName="street" placeholder="Street Name..." />
                      <button type="button" *ngIf="streets().length > 0"
                              (click)="isManualStreet.set(false)"
                              class="text-[10px] text-primary-500 hover:underline text-left">
                        <i class="pi pi-refresh"></i> Back to list
                      </button>
                    </div>
                  </ng-template>
                </div>

                <div class="flex flex-col gap-1 col-span-2">
                  <label class="font-semibold text-sm ml-1">Street Prominent Name</label>
                  <input pInputText formControlName="street_prominent_name"
                         placeholder="e.g., Near NBC Bank, Blue House" />
                </div>

                <div class="flex flex-col gap-1 col-span-2">
                  <label class="font-semibold text-sm ml-1 opacity-60">Post Code (Auto)</label>
                  <input pInputText formControlName="post_code"
                         readonly class="bg-surface-100 dark:bg-surface-800 font-mono border-dashed cursor-not-allowed" />
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-bold text-sm ml-1">Expense Notes</label>
            <textarea
              pTextarea
              formControlName="description"
              [autoResize]="true"
              rows="3"
              placeholder="Add any specific details about this purchase or service..."
              class="w-full text-sm">
            </textarea>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-surface">
            <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="visible.set(false)" />
            <p-button label="Confirm Expense" icon="pi pi-check" type="submit" [disabled]="expenseForm.invalid" severity="success" />
          </div>
        </form>
      </p-dialog>

      <p-dialog
        [(visible)]="detailsVisible"
        header="Expense Details"
        [modal]="true"
        [style]="{width: '500px'}"
        [breakpoints]="{'960px': '75vw', '641px': '95vw'}"
        class="p-fluid">

        <div *ngIf="selectedExpense() as exp" class="flex flex-col gap-6">

          <div class="text-center bg-surface-50 dark:bg-surface-900 p-6 rounded-2xl border border-surface">
            <span class="text-xs font-bold uppercase tracking-widest opacity-60">Total Amount</span>
            <h2 class="text-3xl font-black text-primary-600 mt-1">
              {{ exp.amount | number:'1.2-2' }} <span class="text-sm">TZS</span>
            </h2>
            <div class="flex justify-center items-center gap-2 mt-2 text-sm opacity-80">
              <i class="pi pi-calendar text-primary-500"></i>
              <span>{{ exp.expense_date | date:'EEEE, MMM d, yyyy, h:mm:ss a' }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 px-1">
            <div class="flex flex-col gap-1">
              <span class="text-[10px] font-bold uppercase opacity-50">Payment Method</span>
              <div class="flex items-center gap-2">
                <i class="pi pi-wallet text-surface-500"></i>
                <span class="font-medium">{{ exp.payment_method }}</span>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-[10px] font-bold uppercase opacity-50">Category</span>
              <div class="flex items-center gap-2">
                <i class="pi pi-tag text-surface-500"></i>
                <span class="font-medium">{{ exp.category.name }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <span class="text-[10px] font-bold uppercase opacity-50 px-1">Recipient / Payee</span>
            <div class="p-4 border border-surface rounded-xl flex flex-col gap-3">
              <div class="flex justify-between items-start">
                <div class="flex items-center gap-3">
                  <p-avatar icon="pi pi-user" shape="circle" styleClass="bg-primary-100 text-primary-700"></p-avatar>
                  <div class="flex flex-col">
                    <span class="font-bold text-base capitalize">{{ exp.payee.name }}</span>
                    <span class="text-xs opacity-70">{{ exp.payee.phone_number }}</span>
                  </div>
                </div>
              </div>

              <div *ngIf="exp.payee.address" class="mt-2 p-3 bg-surface-100 dark:bg-surface-800 rounded-lg text-sm">
                <div class="flex items-start gap-2">
                  <i class="pi pi-map-marker text-red-500 mt-1"></i>
                  <div class="flex flex-col gap-1">
                    <span class="font-semibold leading-none">{{ exp.payee.address.region }}, {{ exp.payee.address.district }}</span>
                    <span class="opacity-80 text-xs">{{ exp.payee.address.ward }} • {{ exp.payee.address.street }}</span>
                    <div *ngIf="exp.payee.address.street_prominent_name" class="text-[11px] italic text-primary-500 font-medium">
                      Famous Name: {{ exp.payee.address.street_prominent_name }}
                    </div>
                    <span class="text-[10px] font-mono mt-1 opacity-50">Postal Code: {{ exp.payee.address.post_code }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2 px-1">
            <span class="text-[10px] font-bold uppercase opacity-50">Transaction Description</span>
            <p class="text-sm leading-relaxed italic opacity-80 border-l-4 border-surface-300 pl-3">
              {{ exp.description || 'No detailed description provided.' }}
            </p>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-surface">
            <p-button label="Dismiss" severity="secondary" [text]="true" (onClick)="detailsVisible.set(false)" />
            <p-button label="Edit Expense" icon="pi pi-pencil" size="small" />
          </div>
        </div>
      </p-dialog>
  `,
  providers: [MessageService]
})
export class Expenses implements OnInit {
  expenses = signal<IExpense[]>([]);
  selectedExpenses!: IExpense[] | null;
  expenseForm!: FormGroup;
  selectedExpense = signal<IExpense | null>(null);
  detailsVisible = signal(false);
  visible = signal(false);
  isLoading = signal(false);

  // UI State Toggles
  isNewCategory = signal(false);
  isNewPayee = signal(false);
  hasAddress = signal(false);
  isEditingExistingAddress = signal(false);
  isManualStreet = signal(false);

  // Data Lists
  categories = signal<ICategory[]>([]);
  payees = signal<IPayee[]>([]);
  regions = signal<LocationResponse[]>([]);
  districts = signal<LocationResponse[]>([]);
  wards = signal<LocationResponse[]>([]);
  streets = signal<LocationResponse[]>([]);

  constructor(private expenseService: Master, private messageService: MessageService) {
    this.initForm();

    // Sync Category/Payee validation toggles
    effect(() => {
      this.updateValidation(this.isNewCategory(), 'category_id', 'new_category.name');
      this.updateValidation(this.isNewPayee(), 'payee_id', 'new_payee.payee_name');
    });
  }

  ngOnInit() { this.loadInitialData(); }

  initForm() {
    this.expenseForm = new FormGroup({
      amount: new FormControl('', [Validators.required, Validators.min(1)]),
      payment_method: new FormControl('Cash', Validators.required),
      description: new FormControl(''),

      category_id: new FormControl(null),
      new_category: new FormGroup({
        name: new FormControl(''),
        description: new FormControl('')
      }),

      payee_id: new FormControl(null),
      new_payee: new FormGroup({
        name: new FormControl(''),
        phone_number: new FormControl(''),
        include_address: new FormControl(false),
        address: new FormGroup({
          region: new FormControl(''),
          district: new FormControl({ value: '', disabled: true }),
          ward: new FormControl({ value: '', disabled: true }),
          street: new FormControl({ value: '', disabled: true }),
          post_code: new FormControl({ value: '', disabled: true }),
          street_prominent_name: new FormControl('')
        })
      })
    });
  }

  openNew() {
    this.expenseForm.reset({ payment_method: 'Cash' });
    this.isNewCategory.set(false);
    this.isNewPayee.set(false);
    this.hasAddress.set(false);
    this.visible.set(true);
  }

  viewDetails(expense: IExpense) {
    this.selectedExpense.set(expense);
    this.detailsVisible.set(true);
  }


  onRegionChange(event: any) {
    const regionName = event.value;
    const addr = this.expenseForm.get('new_payee.address') as FormGroup;
    if (!regionName) return;

    ['district', 'ward', 'street', 'post_code'].forEach(k => addr.get(k)?.reset());
    ['ward', 'street'].forEach(k => addr.get(k)?.disable());
    addr.get('district')?.enable();

    this.expenseService.getLocations('districts', regionName).subscribe(data => this.districts.set(data));
  }

  onDistrictChange(event: any) {
    const districtName = event.value;
    const regionName = this.expenseForm.get('new_payee.address.region')?.value;
    const addr = this.expenseForm.get('new_payee.address') as FormGroup;
    if (!districtName) return;

    addr.get('ward')?.reset();
    addr.get('street')?.reset();
    addr.get('ward')?.enable();
    this.expenseService.getLocations('wards', regionName, districtName).subscribe(data => this.wards.set(data));
  }

  onWardChange(event: any) {
    const wardName = event.value;
    const regionName = this.expenseForm.get('new_payee.address.region')?.value;
    const districtName = this.expenseForm.get('new_payee.address.district')?.value;
    const addr = this.expenseForm.get('new_payee.address') as FormGroup;

    if (wardName) {
      addr.get('street')?.reset();
      addr.get('street')?.enable();

      // Set post code automatically
      const selectedWard = this.wards().find(w => w.name === wardName);
      if (selectedWard) addr.get('post_code')?.setValue(selectedWard.post_code);

      // Fetch Streets
      this.expenseService.getLocations('streets', regionName, districtName, wardName).subscribe({
        next: (data) => {
          this.streets.set(data);
          // If data exists, it's a dropdown. If empty, it's manual input.
          this.isManualStreet.set(!data || data.length === 0);
        },
        error: () => {
          this.streets.set([]);
          this.isManualStreet.set(true);
        }
      });
    }
  }


  enableAddressEdit(payee: IPayee) {
    this.isEditingExistingAddress.set(true);
    this.isNewPayee.set(true);
    this.expenseForm.patchValue({
      new_payee: {
        payee_name: payee.name,
        phone_number: payee.phone_number,
        include_address: true
      }
    });
    this.hasAddress.set(true);
  }


  loadInitialData() {
    this.expenseService.getAllExpenses().subscribe(data => this.expenses.set(data));
    this.expenseService.fetchCategories().subscribe(data => this.categories.set(data));
    this.expenseService.fetchPayees().subscribe(data => this.payees.set(data));
    this.expenseService.getLocations('regions').subscribe(data => this.regions.set(data));
  }

  saveExpense() {
      if (this.expenseForm.invalid) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Validation Error',
          detail: 'Please fill in all required fields.'
        });
        return;
      }

      const val = this.expenseForm.getRawValue();
      const payload: any = {
        amount: val.amount,
        description: val.description,
        payment_method: val.payment_method,
      };

      if (this.isNewCategory()) payload.new_category = val.new_category;
      else payload.category_id = val.category_id;

      if (this.isNewPayee()) {
        payload.new_payee = val.new_payee;
        if (this.isEditingExistingAddress()) payload.update_payee_id = val.payee_id;
      } else {
        payload.payee_id = val.payee_id;
      }

      this.expenseService.createExpense(payload).subscribe({
        next: (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Expense recorded successfully!'
          });

          this.visible.set(false);
          this.loadInitialData();
          this.isEditingExistingAddress.set(false);
          this.expenseForm.reset(); // Clear the form after success
        },
        error: (err) => {
          const errorBody = err.error;

          if (typeof errorBody === 'object' && errorBody !== null) {
            this.flattenAndShowErrors(errorBody);
          }

          else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorBody?.message || 'Failed to save expense. Please try again.'
            });
          }
        }
      });
    }

  private flattenAndShowErrors(obj: any, parentKey: string = '') {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const fieldName = parentKey ? `${parentKey} -> ${key}` : key;

        if (Array.isArray(value)) {

          value.forEach((message: string) => {
            this.messageService.add({
              severity: 'error',
              summary: `Validation Error: ${fieldName.replace('_', ' ')}`,
              detail: message,
              life: 5000
            });
          });
        } else if (typeof value === 'object' && value !== null) {
      
          this.flattenAndShowErrors(value, key);
        }
      }
    }
  }

  private updateValidation(isNew: boolean, idKey: string, nameKey: string) {
    const idCtrl = this.expenseForm.get(idKey);
    const nameCtrl = this.expenseForm.get(nameKey);
    if (isNew) { nameCtrl?.setValidators([Validators.required]); idCtrl?.clearValidators(); }
    else { idCtrl?.setValidators([Validators.required]); nameCtrl?.clearValidators(); }
    idCtrl?.updateValueAndValidity(); nameCtrl?.updateValueAndValidity();
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
