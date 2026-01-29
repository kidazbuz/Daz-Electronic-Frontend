import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { HttpClient } from "@angular/common/http";
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { Table, TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { NonNullableFormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MenuItem, MessageService, ConfirmationService } from 'primeng/api';
import { environment } from '../../../shared/environment/env_file';

// Interfaces
import {
  Brand, SupportedInternetService, SupportedResolution,
  ScreenSize, PanelType, Connectivity, Condition
} from '../../../shared/interfaces/spec';

type SpecType = 'Brand' | 'InternetService' | 'Resolution' | 'PanelType' | 'Connectivity' | 'ScreenSize' | 'Condition';

@Component({
  selector: 'app-specifications',
  imports: [
      CommonModule, MenuModule, TableModule, FormsModule, ReactiveFormsModule, ButtonModule, RippleModule,
      ToastModule, ToolbarModule, InputTextModule, TextareaModule, SelectModule, TextareaModule,
      DialogModule, TagModule, IconFieldModule, InputIconModule, ConfirmDialogModule
  ],
  template: `
  <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>

      <div class="p-6 bg-surface-50 dark:bg-surface-950 min-h-screen transition-colors duration-300">

      <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>

      <div class="font-semibold text-xl mb-4">Product Specifications</div>
      <p class="text-surface-500 dark:text-surface-400">Manage technical attributes and product variants</p>
      </div>
      <button
      pButton
      label="Add New {{ specMap().label }}"
      icon="pi pi-plus"
      class="p-button-raised p-button-primary shadow-md"
      (click)="openCreate()">
      </button>
      </div>

      <div class="grid grid-cols-12 gap-6">
      <div class="col-span-12 lg:col-span-3">
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
        <div class="p-4 border-b border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/50">
          <span class="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">Categories</span>
        </div>
        <p-menu [model]="menuItems" styleClass="w-full border-none bg-transparent"></p-menu>
      </div>
      </div>

      <div class="col-span-12 lg:col-span-9">
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
        <p-table
          [value]="specMap().data"
          [loading]="isLoading()"
          [paginator]="true"
          [rows]="10"
          responsiveLayout="stack"
          styleClass="p-datatable-sm p-datatable-striped">

          <ng-template pTemplate="header">
            <tr>
              <th class="bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-200 font-semibold py-4">Name</th>
              <th *ngIf="specMap().label == 'Product Condition'" class="bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-200 font-semibold py-4">Description</th>
              <th class="bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-200 font-semibold py-4 w-32 text-center">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-item>
            <tr class="hover:bg-primary-500/5 transition-colors">
              <td class="font-medium text-surface-700 dark:text-surface-200">{{ item.name }}</td>
              <td *ngIf="specMap().label == 'Product Condition'" class="font-medium text-surface-700 dark:text-surface-200">{{ item.description }}</td>
              <td class="text-center">
                <div class="flex justify-center gap-2">
                  <button
                    pButton
                    icon="pi pi-pencil"
                    class="p-button-rounded p-button-text p-button-info"
                    (click)="openEdit(item)">
                  </button>
                  <button
                    pButton
                    icon="pi pi-trash"
                    class="p-button-rounded p-button-text p-button-danger"
                    (click)="deleteItem(item.id)">
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td [attr.colspan]="activeTab() === 'Brand' ? 3 : 2" class="text-center p-12 text-surface-400 dark:text-surface-500">
                <i class="pi pi-folder-open text-4xl mb-3 block"></i>
                No {{ specMap().label }}s found.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
      </div>
      </div>
      </div>

      <p-dialog
      [(visible)]="displayModal"
      [header]="(specForm.value.id ? 'Edit ' : 'New ') + specMap().label"
      [modal]="true"
      [breakpoints]="{'960px': '75vw', '640px': '90vw'}"
      [style]="{width: '450px'}"
      draggable="false"
      resizable="false">

      <form [formGroup]="specForm" class="flex flex-col gap-4 mt-2">
      <div class="flex flex-col gap-2">
      <label for="name" class="font-semibold text-surface-700 dark:text-surface-200">Name</label>
      <input
        pInputText
        id="name"
        formControlName="name"
        placeholder="Enter name..."
        class="w-full" />
      <small class="text-red-500" *ngIf="specForm.get('name')?.invalid && specForm.get('name')?.touched">
        Name is required.
      </small>

      <label for="description" *ngIf="specMap().label == 'Product Condition'" class="font-semibold text-surface-700 dark:text-surface-200">Description</label>
      <textarea
        *ngIf="specMap().label == 'Product Condition'"
        pTextarea
        [autoResize]="true"
        rows="3"
        cols="30"
        id="description"
        formControlName="description"
        placeholder="Enter description..."
        class="w-full"></textarea>
      <small class="text-red-500" *ngIf="specForm.get('description')?.invalid && specForm.get('description')?.touched">
        description is required.
      </small>
      </div>
      </form>

      <ng-template pTemplate="footer">
      <button pButton label="Cancel" icon="pi pi-times" class="p-button-text text-surface-500" (click)="displayModal.set(false)"></button>
      <button pButton label="Save" icon="pi pi-check" class="p-button-primary" [disabled]="specForm.invalid" (click)="save()"></button>
      </ng-template>
      </p-dialog>
  `,
  providers: [MessageService, ConfirmationService]
})
export class Specifications implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(NonNullableFormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  brands = signal<Brand[]>([]);
  internetServices = signal<SupportedInternetService[]>([]);
  resolutions = signal<SupportedResolution[]>([]);
  panelTypes = signal<PanelType[]>([]);
  connectivityOptions = signal<Connectivity[]>([]);
  screenSizes = signal<ScreenSize[]>([]);
  productConditions = signal<Condition[]>([]);

  isLoading = signal<boolean>(false);
  activeTab = signal<SpecType>('Brand');
  displayModal = signal<boolean>(false);

  menuItems: MenuItem[] = [
    { label: 'Brands', icon: 'pi pi-tag', command: () => this.activeTab.set('Brand') },
    { label: 'Internet Services', icon: 'pi pi-globe', command: () => this.activeTab.set('InternetService') },
    { label: 'Resolutions', icon: 'pi pi-desktop', command: () => this.activeTab.set('Resolution') },
    { label: 'Panel Types', icon: 'pi pi-tablet', command: () => this.activeTab.set('PanelType') },
    { label: 'Connectivity', icon: 'pi pi-share-alt', command: () => this.activeTab.set('Connectivity') },
    { label: 'Screen Sizes', icon: 'pi pi-external-link', command: () => this.activeTab.set('ScreenSize') },
    { label: 'Product Condition', icon: 'pi pi-briefcase', command: () => this.activeTab.set('Condition') }
  ];

  specMap = computed(() => {
    const map: Record<SpecType, { data: any[], endpoint: string, label: string }> = {
      Brand: { data: this.brands(), endpoint: 'brands', label: 'Brand' },
      InternetService: { data: this.internetServices(), endpoint: 'internet-services', label: 'Internet Service' },
      Resolution: { data: this.resolutions(), endpoint: 'resolutions', label: 'Resolution' },
      PanelType: { data: this.panelTypes(), endpoint: 'panel-types', label: 'Panel Type' },
      Connectivity: { data: this.connectivityOptions(), endpoint: 'connectivity', label: 'Connectivity' },
      ScreenSize: { data: this.screenSizes(), endpoint: 'screen-sizes', label: 'Screen Size' },
      Condition: { data: this.productConditions(), endpoint: 'product-conditions', label: 'Product Condition' }
    };
    return map[this.activeTab()];
  });

  specForm = this.fb.group({
    id: [null as number | null],
    name: ['', [Validators.required]],
    description: ['']
  });

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.isLoading.set(true);
    const endpoints = [
      { key: 'Brand', url: 'brands' },
      { key: 'InternetService', url: 'internet-services' },
      { key: 'Resolution', url: 'resolutions' },
      { key: 'PanelType', url: 'panel-types' },
      { key: 'Connectivity', url: 'connectivity' },
      { key: 'ScreenSize', url: 'screen-sizes' },
      { key: 'Condition', url: 'product-conditions' }
    ];

    endpoints.forEach(e => {
      this.http.get<any[]>(`${environment.apiUrl}setups/${e.url}`).subscribe({
        next: (data) => {
          if (e.key === 'Brand') this.brands.set(data);
          if (e.key === 'InternetService') this.internetServices.set(data);
          if (e.key === 'Resolution') this.resolutions.set(data);
          if (e.key === 'PanelType') this.panelTypes.set(data);
          if (e.key === 'Connectivity') this.connectivityOptions.set(data);
          if (e.key === 'ScreenSize') this.screenSizes.set(data);
          if (e.key === 'Condition') this.productConditions.set(data);
        },
        complete: () => this.isLoading.set(false)
      });
    });
  }

  openCreate() {
    this.specForm.reset();
    this.displayModal.set(true);
  }

  openEdit(item: any) {
    this.specForm.patchValue(item);
    this.displayModal.set(true);
  }

  deleteItem(id: number) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this ${this.activeTab()}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.http.delete(`${environment.apiUrl}setups/${this.specMap().endpoint}/${id}/`).subscribe({
          next: () => {
            this.loadAllData();
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Entry removed successfully' });
          }
        });
      }
    });
  }

  save() {
    if (this.specForm.invalid) return;
    const val = this.specForm.value;
    const url = `${environment.apiUrl}setups/${this.specMap().endpoint}/`;

    const req = val.id ? this.http.put(`${url}${val.id}/`, val) : this.http.post(url, val);

    req.subscribe({
      next: () => {
        this.loadAllData();
        this.displayModal.set(false);
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Changes saved successfully' });
      }
    });
  }
}
