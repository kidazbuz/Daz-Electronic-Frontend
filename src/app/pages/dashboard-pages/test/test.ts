import { Component, signal, inject } from '@angular/core';
import { FormControl, FormBuilder, FormArray, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { debounceTime, switchMap, tap, finalize, of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Master } from '../../../shared/services/master';
import { ISearchableProduct } from '../../../shared/interfaces/product';

// PrimeNG Imports
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    InputNumberModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    TagModule
  ],
  template: `
    <div class="relative w-full max-w-4xl mx-auto mt-4 p-4 transition-all">

      <div class="relative w-full group mb-6">
        <i class="pi pi-search absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-60 text-xl z-10"></i>
        <input
          [formControl]="searchControl"
          type="text"
          placeholder="Search Board Number, Model, or SKU..."
          class="w-full pl-14 pr-6 py-4 rounded-xl border outline-none transition-all shadow-md focus:ring-4 focus:ring-primary/10 text-lg"
          style="background-color: var(--surface-ground); color: var(--text-color); border-color: var(--surface-border);"
        >

        @if (isLoading()) {
          <div class="absolute right-5 top-1/2 -translate-y-1/2">
            <i class="pi pi-spin pi-spinner text-primary"></i>
          </div>
        }

        @if (isVisible() && !isLoading()) {
          <div class="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 z-[110] overflow-hidden animate-fade-in">
            <div class="flex flex-col max-h-[50vh] overflow-y-auto">
              @for (product of foundItems(); track product.id) {
                @for (spec of product.specifications; track spec.id) {
                  <div (click)="selectForTesting(product, spec)"
                       class="p-4 flex items-center hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer border-b border-gray-50 dark:border-slate-700/50 transition-all">
                    <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-4">
                      <i class="pi pi-desktop text-blue-600 dark:text-blue-400"></i>
                    </div>
                    <div class="flex flex-col flex-1">
                      <span class="font-bold text-slate-700 dark:text-slate-200 text-sm">{{ product.name }}</span>
                      <span class="text-xs text-slate-400 font-mono">SKU: {{ spec.sku }} | Model: {{ spec.model }}</span>
                    </div>
                    <p-tag value="Test Available" severity="info"></p-tag>
                  </div>
                }
              } @empty {
                <div class="p-10 text-center">
                  <i class="pi pi-search-plus text-3xl text-slate-300 mb-2"></i>
                  <p class="text-slate-500">No blueprints found for "{{ searchControl.value }}"</p>
                </div>
              }
            </div>
          </div>
        }
      </div>

      @if (isTesting()) {
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-slide-down">
          <div class="flex justify-between items-start mb-6 border-b border-slate-50 dark:border-slate-800 pb-4">
            <div>
              <h2 class="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{{ activeProduct().name }}</h2>
              <p class="text-slate-500 font-mono text-sm">Target Model: {{ activeSpec().model }}</p>
            </div>
            <button (click)="isTesting.set(false)" class="text-slate-400 hover:text-red-500 transition-colors">
              <i class="pi pi-times text-xl"></i>
            </button>
          </div>

          <form [formGroup]="evaluationForm" (ngSubmit)="submitFinalEvaluation()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div class="flex flex-col gap-2">
                <label class="text-xs font-bold uppercase text-slate-400 tracking-widest">Device Serial Number</label>
                <input pInputText formControlName="serial_number" placeholder="Scan/Enter S/N" class="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary rounded-lg transition-all" />
              </div>
            </div>

            <p-table [value]="testPoints.controls" styleClass="p-datatable-sm rounded-xl overflow-hidden shadow-inner">
              <ng-template pTemplate="header">
                <tr class="bg-slate-50 dark:bg-slate-800">
                  <th class="dark:text-slate-200 p-4">Component Point</th>
                  <th class="dark:text-slate-200 p-4">Reference</th>
                  <th class="dark:text-slate-200 p-4 w-48 text-center">Actual (V)</th>
                  <th class="dark:text-slate-200 p-4 text-center">Status</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-control let-i="index">
                <tr [formGroupName]="i" class="border-b border-slate-50 dark:border-slate-800">
                  <td class="p-4 font-bold dark:text-slate-300">{{ control.get('label').value }}</td>
                  <td class="p-4 text-slate-500 font-mono text-xs">
                    {{ control.get('expected').value }}V (±{{ control.get('tolerance').value }}%)
                  </td>
                  <td class="p-4">
                    <p-inputNumber formControlName="actual" [minFractionDigits]="2" placeholder="0.00" styleClass="w-full"></p-inputNumber>
                  </td>
                  <td class="p-4 text-center">
                    @if (control.get('actual').value !== null) {
                      @const isOk = checkTolerance(control.value);
                      <p-tag [severity]="isOk ? 'success' : 'danger'" [value]="isOk ? 'PASS' : 'FAIL'" [rounded]="true"></p-tag>
                    } @else {
                      <span class="text-[10px] text-slate-300 italic">Waiting...</span>
                    }
                  </td>
                </tr>
              </ng-template>
            </p-table>

            <div class="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-50 dark:border-slate-800">
              <p-button label="Discard" severity="secondary" [text]="true" (onClick)="isTesting.set(false)"></p-button>
              <p-button label="Submit Evaluation" icon="pi pi-cloud-upload" type="submit" [disabled]="evaluationForm.invalid"></p-button>
            </div>
          </form>
        </div>
      }
    </div>
  `
})
export class Test {
  private fb = inject(FormBuilder);
  private masterService = inject(Master);

  searchControl = new FormControl('', { nonNullable: true });
  evaluationForm = this.fb.group({
    serial_number: ['', Validators.required],
    test_results: this.fb.array([])
  });

  isVisible = signal(false);
  isLoading = signal(false);
  isOk: boolean = false;
  isTesting = signal(false);
  activeProduct = signal<any>(null);
  activeSpec = signal<any>(null);

  private searchResults$ = this.searchControl.valueChanges.pipe(
    debounceTime(300),
    switchMap(term => {
      const query = term.trim();
      if (!query) {
        this.isVisible.set(false);
        return of([]);
      }
      this.isLoading.set(true);
      this.isVisible.set(true);
      return this.masterService.fetchProducts(query).pipe(
        finalize(() => this.isLoading.set(false))
      );
    })
  );

  foundItems = toSignal(this.searchResults$, { initialValue: [] });

  get testPoints() { return this.evaluationForm.get('test_results') as FormArray; }

  selectForTesting(product: any, spec: any) {
    this.isVisible.set(false);
    this.activeProduct.set(product);
    this.activeSpec.set(spec);

    this.masterService.getTestBlueprint(spec.id).subscribe(blueprint => {
      this.testPoints.clear();
      // Logic: Dynamically Draw from DB Blueprint
      blueprint.checkpoints.forEach((cp: any) => {
        this.testPoints.push(this.fb.group({
          test_point: [cp.id],
          label: [cp.point_label],
          expected: [cp.expected_voltage],
          tolerance: [cp.tolerance_percent],
          actual: [null, Validators.required]
        }));
      });
      this.isTesting.set(true);
    });
  }

  checkTolerance(val: any): boolean {
    const diff = Math.abs(val.actual - val.expected);
    const allowed = val.expected * (val.tolerance / 100);
    return diff <= allowed;
  }

  submitFinalEvaluation() {
    if (this.evaluationForm.valid) {
      const payload = {
        product_spec: this.activeSpec().id,
        serial_number: this.evaluationForm.value.serial_number,
        electrical_results: this.evaluationForm.value.test_results
      };

      this.masterService.saveEvaluation(payload).subscribe(() => {
        this.isTesting.set(false);
        this.evaluationForm.reset();
        this.searchControl.setValue('');
      });
    }
  }
}
