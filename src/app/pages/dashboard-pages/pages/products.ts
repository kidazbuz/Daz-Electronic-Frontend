import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { FileUploadModule } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Product, Category, Spec, ProductService } from '../../../shared/services/product-service';
import { forkJoin } from 'rxjs';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ChipModule } from 'primeng/chip';
import { BadgeModule } from 'primeng/badge';
import { GalleriaModule } from 'primeng/galleria';
import { UploadFile, ProductMedia } from '../../../shared/interfaces/product'


interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

interface ExportColumn {
    title: string;
    dataKey: string;
}

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [
        CommonModule,
        TabsModule,
        DividerModule,
        MultiSelectModule,
        TableModule,
        BadgeModule,
        GalleriaModule,
        FormsModule,
        FileUploadModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        ChipModule,
        RatingModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        RadioButtonModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        SelectModule,
        ToggleSwitchModule
    ],
    template: `
    <p-toast />

    <div class="font-semibold text-xl mb-4">Manage Products and thier variants</div>
        <p-tabs value="0">
            <p-tablist>
                <p-tab value="0">Products</p-tab>
                <p-tab value="1">Specifications</p-tab>
                <p-tab value="2">Media</p-tab>
            </p-tablist>
            <p-tabpanels>
                <p-tabpanel value="0">

                <p-toolbar styleClass="mb-6 mt-6">
                    <ng-template #start>
                        <p-button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
                        <p-button severity="secondary" label="Delete" icon="pi pi-trash" outlined (onClick)="deleteSelectedProducts()" [disabled]="!selectedProducts || !selectedProducts.length" />
                    </ng-template>
                    <ng-template #end>
                        <p-button label="Export" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()" />
                    </ng-template>
                </p-toolbar>
                <p-table
                    #dtProducts
                    [value]="products()"
                    [rows]="10"
                    [paginator]="true"
                    [globalFilterFields]="['name', 'category', 'status']"
                    [(selection)]="selectedProducts"
                    [rowHover]="true"
                    dataKey="id"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                    [showCurrentPageReport]="true"
                >
                    <ng-template #caption>
                        <div class="flex items-center justify-between">
                            <h5 class="m-0">Manage Products</h5>
                            <p-iconfield>
                                <p-inputicon styleClass="pi pi-search" />
                                <input pInputText type="text" (input)="onGlobalFilter(dtProducts, $event)" placeholder="Search..." />
                            </p-iconfield>
                        </div>
                    </ng-template>
                    <ng-template #header>
                        <tr>
                            <th style="width: 3rem"><p-tableHeaderCheckbox /></th>
                            <th pSortableColumn="name">Name <p-sortIcon field="name" /></th>
                            <th pSortableColumn="category">Category <p-sortIcon field="category" /></th>
                            <th>description</th>
                            <th pSortableColumn="created_at">Date Registered <p-sortIcon field="created_at" /></th>
                            <th>Status</th>
                            <th>Action</th>

                        </tr>
                    </ng-template>
                    <ng-template #body let-product>
                        <tr>
                            <td><p-tableCheckbox [value]="product" /></td>
                            <td>{{ product.name }}</td>
                            <td>{{ getCategoryName(product.category) }}</td>
                            <td>{{ product.description }}</td>
                            <td>{{ product.created_at | date:'MMM d, y h:mm a' }}</td>
                            <td>
                                <p-tag [value]="product.is_active ? 'ACTIVE' : 'INACTIVE'" [severity]="product.is_active ? 'success' : 'danger'" />
                            </td>
                            <td>
                                <div class="flex gap-2">
                                  <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editProduct(product)" />
                                  <p-button icon="pi pi-trash" severity="danger" class="mr-2" [rounded]="true" [outlined]="true" (click)="deleteProduct(product)" />
                                  <p-button icon="pi pi-cog" label="Add Specs" [rounded]="true" [outlined]="true" severity="help" (click)="openSpecDialog(product)" />

                                </div>
                            </td>

                        </tr>
                    </ng-template>
                </p-table>

                </p-tabpanel>
                <p-tabpanel value="1">

                <p-toast />

                  <p-toolbar styleClass="mb-6 mt-6">
                  <ng-template #start>
                      <p-button
                          severity="danger"
                          label="Delete"
                          icon="pi pi-trash"
                          outlined
                          (onClick)="deleteSelectedSpecs()"
                          [disabled]="!selectedSpecs || !selectedSpecs.length" />
                  </ng-template>
                  <ng-template #end>
                      <p-button label="Export CSV" icon="pi pi-upload" severity="secondary" (onClick)="dt.exportCSV()" />
                  </ng-template>
                  </p-toolbar>

                  <p-table
                      #dtSpecs
                      [value]="specs()"
                      [rows]="10"
                      [paginator]="true"
                      [globalFilterFields]="['model']"
                      [(selection)]="selectedSpecs"
                      [rowHover]="true"
                      dataKey="id"
                      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} specifications"
                      [showCurrentPageReport]="true"
                    >

                      <ng-template #caption>
                          <div class="flex items-center justify-between">
                              <h5 class="m-0">Product Specifications</h5>
                              <p-iconfield>
                                  <p-inputicon styleClass="pi pi-search" />
                                  <input
                                      pInputText
                                      type="text"
                                      (input)="onGlobalFilter(dtSpecs, $event)"
                                      placeholder="Search Models..." />
                              </p-iconfield>
                          </div>
                      </ng-template>

                      <ng-template #header>
                          <tr>
                              <th style="width: 3rem"><p-tableHeaderCheckbox /></th>
                              <th pSortableColumn="model">Model <p-sortIcon field="model" /></th>
                              <th pSortableColumn="actual_price">Actual Price <p-sortIcon field="actual_price" /></th>
                              <th pSortableColumn="discounted_price">Discounted Price <p-sortIcon field="discounted_price" /></th>
                              <th pSortableColumn="brand">Brand<p-sortIcon field="brand" /></th>
                              <th>Smart</th>
                              <th style="width: 5rem">Action</th>
                          </tr>
                      </ng-template>

                      <ng-template #body let-spec>
                          <tr>
                              <td><p-tableCheckbox [value]="spec" /></td>
                              <td class="font-bold">{{ spec.model }}</td>
                              <td>
                                  <span class="text-surface-500 mr-2">{{ spec.actual_price | currency:'TZS' }}</span>
                              </td>
                              <td>

                                  <span class="text-green-600 font-bold">{{ spec.discounted_price | currency:'TZS' }}</span>
                              </td>
                              <td>{{ getBrandName(spec.brand) }}</td>
                              <td>
                                  <p-tag [value]="spec.smart_features ? 'SMART' : 'BASIC'"
                                         [severity]="spec.smart_features ? 'success' : 'secondary'" />
                              </td>
                              <td>
                                  <div class="flex gap-2">
                                      <p-button icon="pi pi-eye" severity="secondary" [rounded]="true" [text]="true"
                                          (onClick)="viewSpec(spec)" pTooltip="View Details" />

                                      <p-button icon="pi pi-pencil" severity="success" [rounded]="true" [text]="true"
                                          (onClick)="editSpec(spec)" pTooltip="Edit" />

                                      <p-button icon="pi pi-images" severity="info" [rounded]="true" [text]="true"
                                          (onClick)="openMediaDialog(spec)" pTooltip="Add Media" />

                                      <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [text]="true"
                                          (onClick)="deleteSpec(spec)" pTooltip="Delete" />
                                  </div>
                              </td>
                          </tr>
                      </ng-template>
                  </p-table>

                </p-tabpanel>
                <p-tabpanel value="2">
                  <p-toast />
                  <p-toolbar styleClass="mb-6 mt-6">
                      <ng-template #start>
                          <p-button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
                          <p-button severity="secondary" label="Delete" icon="pi pi-trash" outlined (onClick)="deleteSelectedProducts()" [disabled]="!selectedProducts || !selectedProducts.length" />
                      </ng-template>
                      <ng-template #end>
                          <p-button label="Export" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()" />
                      </ng-template>
                  </p-toolbar>
                  <p-table
                      #dtMedia
                      [value]="media()"
                      [rows]="10"
                      [paginator]="true"
                      [globalFilterFields]="['productName', 'model_number']"
                      [(selection)]="selectedProducts"
                      [rowHover]="true"
                      dataKey="id"
                      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} media"
                      [showCurrentPageReport]="true"
                  >
                      <ng-template #caption>
                          <div class="flex items-center justify-between">
                              <h5 class="m-0">Manage Specs Media</h5>
                              <p-iconfield>
                                  <p-inputicon styleClass="pi pi-search" />
                                  <input pInputText type="text" (input)="onGlobalFilter(dtMedia, $event)" placeholder="Search..." />
                              </p-iconfield>
                          </div>
                      </ng-template>
                      <ng-template #header>
                          <tr>
                              <th style="width: 3rem"><p-tableHeaderCheckbox /></th>
                              <th pSortableColumn="productName">Product Name <p-sortIcon field="productName" /></th>
                              <th>Description</th>
                              <th pSortableColumn="model_number">Model No.<p-sortIcon field="model_number" /></th>
                              <th>Medias</th>

                          </tr>
                      </ng-template>
                      <ng-template #body let-specMedia>
                          <tr>
                              <td><p-tableCheckbox [value]="media" /></td>
                              <td>{{ specMedia.productName }}</td>
                              <td>{{ specMedia.productDescription }}</td>
                              <td>{{ specMedia.model_number }}</td>
                              <td>
                                  <div class="flex gap-2">
                                    <div (click)="openMediaPreviewDialog(specMedia, 'image')"
                                         class="flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer transition-all border border-transparent active:scale-95 bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-100 font-medium">

                                      <i class="pi pi-image text-sm text-primary"></i>
                                      <span class="text-sm">Images</span>

                                      <p-badge
                                        [value]="specMedia.images?.length || 0"
                                        severity="info">
                                      </p-badge>
                                    </div>

                                    <div (click)="openMediaPreviewDialog(specMedia, 'video')"
                                         class="flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer transition-all border border-transparent active:scale-95 bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-100 font-medium">

                                      <i class="pi pi-video text-sm text-orange-500"></i>
                                      <span class="text-sm">Videos</span>

                                      <p-badge
                                        [value]="specMedia.videos?.length || 0"
                                        severity="warn">
                                      </p-badge>
                                    </div>
                                  </div>
                                </td>
                      </ng-template>
                  </p-table>

                </p-tabpanel>
            </p-tabpanels>
        </p-tabs>


        <p-dialog
          [(visible)]="productDialog"
          [style]="{ width: '450px' }"
          header="Product Details"
          [modal]="true"
          [draggable]="false"
          [resizable]="false"
          styleClass="p-fluid"
          [contentStyle]="{ 'max-height': '650px', 'overflow-y': 'auto' }">
          <ng-template #content>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">

                  <div class="flex flex-col md:col-span-2">
                      <label for="name" class="font-semibold mb-2">Name</label>
                      <input type="text" pInputText id="name" [(ngModel)]="product.name" required autofocus />
                      <small class="p-error" *ngIf="submitted && !product.name">Name is required.</small>
                  </div>

                  <div class="flex flex-col md:col-span-2">
                      <label for="category" class="font-semibold mb-2">Category</label>
                      <p-select
                          id="category"
                          [options]="categories()"
                          [(ngModel)]="product.category"
                          optionLabel="name"
                          optionValue="id"
                          placeholder="Select Category"
                          [filter]="true"
                          filterBy="name"
                          appendTo="body" />
                  </div>

                  <div class="md:col-span-2 flex flex-col mt-4">
                      <label for="description" class="block font-bold mb-3">Product Description</label>
                      <textarea id="description" pTextarea [(ngModel)]="product.description" required rows="4" fluid></textarea>
                  </div>

                  <div class="md:col-span-2 flex items-center gap-6 py-4 border-t border-surface-200 dark:border-surface-700">
                      <span class="font-semibold">Active Status:</span>
                      <div class="flex items-center gap-4">
                          <div class="flex items-center gap-2">
                              <p-radiobutton name="is_active" [value]="true" [(ngModel)]="product.is_active" inputId="activeYes" />
                              <label for="activeYes" class="cursor-pointer">Yes</label>
                          </div>
                          <div class="flex items-center gap-2">
                              <p-radiobutton name="is_active" [value]="false" [(ngModel)]="product.is_active" inputId="activeNo" />
                              <label for="activeNo" class="cursor-pointer">No</label>
                          </div>
                      </div>
                  </div>
              </div>
          </ng-template>

          <ng-template #footer>
              <div class="flex justify-end gap-2">
                  <p-button label="Cancel" icon="pi pi-times" [text]="true" severity="secondary" (click)="hideDialog()" />
                  <p-button label="Save Product" icon="pi pi-check" severity="primary" (click)="saveProduct()" />
              </div>
          </ng-template>
      </p-dialog>

    <p-dialog [(visible)]="specDialog" [style]="{ width: '600px' }" header="Product Specifications" [modal]="true">
        <div class="flex flex-col gap-4">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block font-bold mb-2">Model Number *</label>
                    <input pInputText [(ngModel)]="spec.model" fluid />
                </div>
                <div>
                    <label class="block font-bold mb-2">Actual Price *</label>
                    <p-inputnumber [(ngModel)]="spec.actual_price" mode="currency" currency="TZS" locale="en-US" fluid />
                </div>
            </div>

            <div>
                <label class="block font-bold mb-2">Discounted Price *</label>
                <p-inputnumber [(ngModel)]="spec.discounted_price" mode="currency" currency="TZS" locale="en-US" fluid />
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block font-bold mb-2">Product Condition</label>
                    <p-select
                      id="brand"
                      [options]="setupData()['conditions']"
                      [(ngModel)]="spec.condition"
                      optionLabel="name"
                      optionValue="id"
                      placeholder="Select Condition"
                      [filter]="true"
                      filterBy="name"
                      appendTo="body"
                      fluid />
                </div>
                <div class="flex flex-col gap-2">
                <label for="color" class="font-semibold">Color</label>
                  <p-select
                      id="color"
                      [options]="colors"
                      [(ngModel)]="spec.color"
                      optionLabel="name"
                      optionValue="name"
                      placeholder="Select Color"
                      [filter]="true"
                      filterBy="name"
                      appendTo="body"
                      [showClear]="true"
                      fluid>

                      <ng-template #item let-item>
                          <div class="flex items-center gap-3">
                              <div
                                  class="w-4 h-4 rounded-full border border-surface-300 dark:border-surface-600 shadow-sm"
                                  [style.backgroundColor]="item.id">
                              </div>
                              <span>{{ item.name }}</span>
                          </div>
                      </ng-template>
                  </p-select>
                </div>
            </div>

            <hr />

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block font-bold mb-2">Brand</label>
                    <p-select
                      id="brand"
                      [options]="setupData()['brands']"
                      [(ngModel)]="spec.brand"
                      optionLabel="name"
                      optionValue="id"
                      placeholder="Select Brand"
                      [filter]="true"
                      filterBy="name"
                      appendTo="body"
                      fluid />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="block font-bold mb-2">Is Smart?</label>
                    <div class="flex items-center h-full">
                        <p-toggleswitch [(ngModel)]="spec.smart_features" (onChange)="onSmartToggleChange($event)" />
                        <span class="ml-2 text-sm text-surface-500">{{ spec.smart_features ? 'Smart Device' : 'Basic Device' }}</span>
                    </div>
                </div>
            </div>

            @if (spec.smart_features) {
              <div class="flex flex-col gap-2 mt-4 animate-fade-in">
                  <label class="block font-bold text-surface-900 dark:text-surface-0">
                      Supported Internet Services
                  </label>
                  <p-multiselect
                      [options]="setupData()['services']"
                      [(ngModel)]="spec.supported_internet_services"
                      optionLabel="name"
                      optionValue="id"
                      placeholder="Select Services"
                      display="chip"
                      [filter]="true"
                      filterPlaceholder="Search services..."
                      class="w-full"
                      styleClass="w-full"
                      overlayStyleClass="dark:bg-surface-900"
                      fluid />
              </div>
          }

            <div>
                <div class="flex justify-between items-center mb-2">
                    <span class="font-bold">Product Connectivity</span>
                    <p-button icon="pi pi-plus" label="Add" size="small" (onClick)="addConnectivity()" />
                </div>
                <div *ngFor="let item of spec.product_connectivity; let i = index" class="grid grid-cols-12 gap-2 mb-2 items-center">
                    <div class="col-span-6">
                      <p-select
                        id="connectivity"
                        [options]="setupData()['connectivities']"
                        [(ngModel)]="item.connectivity"
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Select Connectivity Type"
                        [filter]="true"
                        filterBy="name"
                        appendTo="body"
                        fluid />
                    </div>
                    <div class="col-span-4">
                        <p-inputnumber [(ngModel)]="item.connectivity_count" placeholder="Count" fluid />
                    </div>
                    <div class="col-span-2">
                        <p-button icon="pi pi-trash" severity="danger" [text]="true" (onClick)="removeConnectivity(i)" />
                    </div>
                </div>
            </div>

            <div class="p-4 rounded-border border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900">
                <span class="block font-bold mb-3 text-sm text-surface-700 dark:text-surface-0">
                    Display Specifications
                </span>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold text-surface-500">Screen Size</label>
                        <p-select
                          id="screen_size"
                          [options]="setupData()['screens']"
                          [(ngModel)]="spec.screen_size"
                          optionLabel="name"
                          optionValue="id"
                          placeholder="Select Size"
                          [filter]="true"
                          filterBy="name"
                          appendTo="body"
                          fluid />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold text-surface-500">Resolution</label>
                        <p-select
                          id="resolution"
                          [options]="setupData()['resolutions']"
                          [(ngModel)]="spec.resolution"
                          optionLabel="name"
                          optionValue="id"
                          placeholder="Select Resolution"
                          [filter]="true"
                          filterBy="name"
                          appendTo="body"
                          fluid />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold text-surface-500">Panel Type</label>
                        <p-select
                          id="panel_type"
                          [options]="setupData()['panels']"
                          [(ngModel)]="spec.panel_type"
                          optionLabel="name"
                          optionValue="id"
                          placeholder="Select Panel Type"
                          [filter]="true"
                          filterBy="name"
                          appendTo="body"
                          fluid />
                    </div>
                </div>
            </div>

            <div class="p-4 rounded-border border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900">
              <span class="block font-bold mb-3 text-sm text-surface-700 dark:text-surface-0">
                  Electrical Specifications
              </span>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div class="flex flex-col gap-1">
                      <label class="text-xs font-medium text-surface-500">Voltage</label>
                      <input pInputText [(ngModel)]="spec.electrical_specs.voltage" placeholder="e.g. 220V" class="w-full" />
                  </div>
                  <div class="flex flex-col gap-1">
                      <label class="text-xs font-medium text-surface-500">Max Wattage</label>
                      <input pInputText [(ngModel)]="spec.electrical_specs.max_wattage" placeholder="e.g. 1500W" class="w-full" />
                  </div>
                  <div class="flex flex-col gap-1">
                      <label class="text-xs font-medium text-surface-500">Frequency</label>
                      <input pInputText [(ngModel)]="spec.electrical_specs.frequency" placeholder="e.g. 60Hz" class="w-full" />
                  </div>
              </div>
          </div>
        </div>

        <ng-template #footer>
            <p-button label="Cancel" icon="pi pi-times" text (click)="specDialog = false" />
            <p-button label="Save Specifications" icon="pi pi-check" (click)="saveSpecs()" [disabled]="!spec.model || !spec.actual_price" />
        </ng-template>
    </p-dialog>

    <p-dialog
        [(visible)]="viewDialog"
        [style]="{ width: '800px' }"
        header="Product Specification Report"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        class="spec-details-dialog">

        <ng-template #content>
            <div *ngIf="currentSpec" class="flex flex-col gap-4 py-2">

                <div class="flex justify-between items-center border-b border-surface-200 dark:border-surface-700 pb-4">
                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-bold text-color-secondary uppercase tracking-widest">Model Reference</label>
                        <span class="text-2xl font-mono text-primary font-bold">{{ currentSpec.model }}</span>
                        <div class="flex gap-2 items-center">
                            <p-tag [value]="currentSpec.smart_features ? 'SMART' : 'BASIC'"
                                   [severity]="currentSpec.smart_features ? 'success' : 'secondary'" />
                            <span class="text-xs text-color-secondary font-mono">Product ID: #{{ currentSpec.product }}</span>
                        </div>
                    </div>
                    <div class="bg-primary-50 dark:bg-primary-900/30 p-3 border-round text-right">
                        <label class="block text-xs font-bold text-primary uppercase mb-1">Discounted Price</label>
                        <div class="text-2xl font-black text-primary font-mono">{{ currentSpec.discounted_price | currency }}</div>
                        <div class="text-xs text-color-secondary line-through">MSRP: {{ currentSpec.actual_price | currency }}</div>
                    </div>
                </div>

                <p-tabs value="0">
                    <p-tablist>
                        <p-tab value="0"><i class="pi pi-cog mr-2"></i>Technical Specs</p-tab>
                        <p-tab value="1"><i class="pi pi-share-alt mr-2"></i>Connectivity</p-tab>
                        <p-tab value="2"><i class="pi pi-globe mr-2"></i>Smart Features</p-tab>
                    </p-tablist>

                    <p-tabpanels>
                        <p-tabpanel value="0">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div class="surface-card p-4 border-round border-1 border-surface-200 dark:border-surface-700">
                                    <h5 class="mt-0 mb-3 text-primary uppercase text-xs tracking-wider">Electrical Parameters</h5>
                                    <div class="space-y-3">
                                        <div class="flex justify-between items-center border-b border-surface-100 dark:border-surface-800 pb-2">
                                            <span class="text-sm text-color-secondary">Operational Voltage</span>
                                            <span class="font-bold">{{ currentSpec.electrical_specs.voltage }}</span>
                                        </div>
                                        <div class="flex justify-between items-center border-b border-surface-100 dark:border-surface-800 pb-2">
                                            <span class="text-sm text-color-secondary">Maximum Wattage</span>
                                            <span class="font-bold font-mono">{{ currentSpec.electrical_specs.max_wattage }}</span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <span class="text-sm text-color-secondary">Frequency</span>
                                            <span class="font-bold">{{ currentSpec.electrical_specs.frequency }}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="surface-card p-4 border-round border-1 border-surface-200 dark:border-surface-700">
                                    <h5 class="mt-0 mb-3 text-primary uppercase text-xs tracking-wider">Display & Build</h5>
                                    <div class="space-y-3">
                                        <div class="flex justify-between items-center border-b border-surface-100 dark:border-surface-800 pb-2">
                                            <span class="text-sm text-color-secondary">Screen Size</span>
                                            <span class="font-bold">{{ currentSpec.screen_size }}</span>
                                        </div>
                                        <div class="flex justify-between items-center border-b border-surface-100 dark:border-surface-800 pb-2">
                                            <span class="text-sm text-color-secondary">Resolution</span>
                                            <p-tag [value]="getResolutionName(currentSpec.resolution)" severity="info" [rounded]="true" />
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <span class="text-sm text-color-secondary">Panel Technology</span>
                                            <span class="font-bold">{{ getPanelName(currentSpec.panel_type) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </p-tabpanel>

                        <p-tabpanel value="1">
                            <div class="mt-2 border-1 border-surface-200 dark:border-surface-700 border-round overflow-hidden">
                                <p-table [value]="currentSpec.product_connectivity" styleClass="p-datatable-sm p-datatable-striped">
                                    <ng-template #header>
                                        <tr>
                                            <th class="bg-surface-50 dark:bg-surface-800 text-xs uppercase">Interface Type</th>
                                            <th class="bg-surface-50 dark:bg-surface-800 text-xs uppercase text-center">Protocol ID</th>
                                            <th class="bg-surface-50 dark:bg-surface-800 text-xs uppercase text-right">Port Count</th>
                                        </tr>
                                    </ng-template>
                                    <ng-template #body let-conn>
                                        <tr>
                                            <td class="font-bold">
                                                <i class="pi pi-bolt mr-2 text-primary"></i>
                                                {{ conn.connectivity }}
                                            </td>
                                            <td class="text-center font-mono text-xs text-color-secondary">#00{{ conn.connectivity }}</td>
                                            <td class="text-right">
                                                <span class="bg-primary-100 dark:bg-primary-900 text-primary font-bold px-3 py-1 border-round">
                                                    {{ conn.connectivity_count }}
                                                </span>
                                            </td>
                                        </tr>
                                    </ng-template>
                                </p-table>
                            </div>
                        </p-tabpanel>

                        <p-tabpanel value="2">
                            <div class="flex flex-col gap-4 mt-2">
                                <div class="p-4 bg-surface-50 dark:bg-surface-800 border-round">
                                    <h5 class="mt-0 mb-3 text-sm font-bold uppercase tracking-tighter">Supported Internet Services</h5>
                                    <div class="flex flex-wrap gap-2">
                                        <p-chip *ngFor="let service of currentSpec.supported_internet_services"
                                                [label]="service.name"
                                                icon="pi pi-globe" />
                                        <div *ngIf="!currentSpec.supported_internet_services.length" class="text-sm italic text-color-secondary">
                                            No specific internet services listed.
                                        </div>
                                    </div>
                                </div>

                                <div class="grid grid-cols-2 gap-4">
                                    <div class="flex items-center gap-3 p-3 border-1 border-surface-200 dark:border-surface-700 border-round">
                                        <i class="pi pi-palette text-2xl text-primary"></i>
                                        <div>
                                            <small class="block text-color-secondary uppercase text-xs font-bold">Chassis Color</small>
                                            <span class="font-medium">{{ currentSpec.color || 'Standard Finish' }}</span>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-3 p-3 border-1 border-surface-200 dark:border-surface-700 border-round">
                                        <i class="pi pi-verified text-2xl text-green-500"></i>
                                        <div>
                                            <small class="block text-color-secondary uppercase text-xs font-bold">Brand Entity</small>
                                            <span class="font-medium">{{ getBrandName(currentSpec.brand) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </p-tabpanel>
                    </p-tabpanels>
                </p-tabs>
            </div>
        </ng-template>

        <ng-template #footer>
            <div class="flex justify-between w-full">
                <p-button label="Export Datasheet" icon="pi pi-download" severity="help" [text]="true" />
                <p-button label="Close" icon="pi pi-times" (onClick)="viewDialog = false" severity="secondary" outlined />
            </div>
        </ng-template>
    </p-dialog>

    <p-dialog [(visible)]="editDialog" [style]="{ width: '600px' }" header="Edit Product Specifications" [modal]="true">
        <div class="flex flex-col gap-4">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block font-bold mb-2">Model Number *</label>
                    <input pInputText [(ngModel)]="spec.model" fluid />
                </div>
                <div>
                    <label class="block font-bold mb-2">Actual Price *</label>
                    <p-inputnumber [(ngModel)]="spec.actual_price" mode="currency" currency="TZS" locale="en-US" fluid />
                </div>
            </div>

            <div>
                <label class="block font-bold mb-2">Discounted Price *</label>
                <p-inputnumber [(ngModel)]="spec.discounted_price" mode="currency" currency="TZS" locale="en-US" fluid />
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block font-bold mb-2">Product Condition</label>
                    <p-select
                      id="brand"
                      [options]="setupData()['conditions']"
                      [(ngModel)]="spec.condition"
                      optionLabel="name"
                      optionValue="id"
                      placeholder="Select Condition"
                      [filter]="true"
                      filterBy="name"
                      appendTo="body"
                      fluid />
                </div>
                <div class="flex flex-col gap-2">
                <label for="color" class="font-semibold">Color</label>
                  <p-select
                      id="color"
                      [options]="colors"
                      [(ngModel)]="spec.color"
                      optionLabel="name"
                      optionValue="name"
                      placeholder="Select Color"
                      [filter]="true"
                      filterBy="name"
                      appendTo="body"
                      [showClear]="true"
                      fluid>

                      <ng-template #item let-item>
                          <div class="flex items-center gap-3">
                              <div
                                  class="w-4 h-4 rounded-full border border-surface-300 dark:border-surface-600 shadow-sm"
                                  [style.backgroundColor]="item.id">
                              </div>
                              <span>{{ item.name }}</span>
                          </div>
                      </ng-template>
                  </p-select>
                </div>
            </div>

            <hr />

            <div class="grid grid-cols-2 gap-4">
                <div>
                <label class="block font-bold mb-2">Brand</label>
                  <p-select
                    id="brand"
                    [options]="setupData()['brands']"
                    [(ngModel)]="spec.brand"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Select Brand"
                    [filter]="true"
                    filterBy="name"
                    appendTo="body"
                    fluid />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="block font-bold mb-2">Is Smart?</label>
                    <div class="flex items-center h-full">
                        <p-toggleswitch [(ngModel)]="spec.smart_features" (onChange)="onSmartToggleChange($event)" />
                        <span class="ml-2 text-sm text-surface-500">{{ spec.smart_features ? 'Smart Device' : 'Basic Device' }}</span>
                    </div>
                </div>
            </div>

            @if (spec.smart_features) {
              <div class="flex flex-col gap-2 mt-4 animate-fade-in">
                  <label class="block font-bold text-surface-900 dark:text-surface-0">
                      Supported Internet Services
                  </label>
                  <p-multiselect
                      [options]="setupData()['services']"
                      [(ngModel)]="spec.supported_internet_services"
                      optionLabel="name"
                      optionValue="id"
                      placeholder="Select Services"
                      display="chip"
                      [filter]="true"
                      filterPlaceholder="Search services..."
                      class="w-full"
                      styleClass="w-full"
                      overlayStyleClass="dark:bg-surface-900"
                      fluid />
              </div>
          }

            <div>
                <div class="flex justify-between items-center mb-2">
                    <span class="font-bold">Product Connectivity</span>
                    <p-button icon="pi pi-plus" label="Add" size="small" (onClick)="addToUpdateConnectivity()" />
                </div>
                <div *ngFor="let item of spec.product_connectivity; let i = index" class="grid grid-cols-12 gap-2 mb-2 items-center">
                    <div class="col-span-6">
                      <p-select
                        id="connectivity"
                        [options]="setupData()['connectivities']"
                        [(ngModel)]="item.connectivity"
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Select Connectivity Type"
                        [filter]="true"
                        filterBy="name"
                        appendTo="body"
                        fluid />
                    </div>
                    <div class="col-span-4">
                        <p-inputnumber [(ngModel)]="item.connectivity_count" placeholder="Count" fluid />
                    </div>
                    <div class="col-span-2">
                        <p-button icon="pi pi-trash" severity="danger" [text]="true" (onClick)="removeConnectivity(i)" />
                    </div>
                </div>
            </div>

            <div class="p-4 rounded-border border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900">
                <span class="block font-bold mb-3 text-sm text-surface-700 dark:text-surface-0">
                    Display Specifications
                </span>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold text-surface-500">Screen Size</label>
                        <p-select
                          id="screen_size"
                          [options]="setupData()['screens']"
                          [(ngModel)]="spec.screen_size"
                          optionLabel="name"
                          optionValue="id"
                          placeholder="Select Size"
                          [filter]="true"
                          filterBy="name"
                          appendTo="body"
                          fluid />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold text-surface-500">Resolution</label>
                        <p-select
                          id="resolution"
                          [options]="setupData()['resolutions']"
                          [(ngModel)]="spec.resolution"
                          optionLabel="name"
                          optionValue="id"
                          placeholder="Select Resolution"
                          [filter]="true"
                          filterBy="name"
                          appendTo="body"
                          fluid />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold text-surface-500">Panel Type</label>
                        <p-select
                          id="panel_type"
                          [options]="setupData()['panels']"
                          [(ngModel)]="spec.panel_type"
                          optionLabel="name"
                          optionValue="id"
                          placeholder="Select Panel Type"
                          [filter]="true"
                          filterBy="name"
                          appendTo="body"
                          fluid />
                    </div>
                </div>
            </div>

            <div class="p-4 rounded-border border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900">
              <span class="block font-bold mb-3 text-sm text-surface-700 dark:text-surface-0">
                  Electrical Specifications
              </span>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div class="flex flex-col gap-1">
                      <label class="text-xs font-medium text-surface-500">Voltage</label>
                      <input pInputText [(ngModel)]="spec.electrical_specs.voltage" placeholder="e.g. 220V" class="w-full" />
                  </div>
                  <div class="flex flex-col gap-1">
                      <label class="text-xs font-medium text-surface-500">Max Wattage</label>
                      <input pInputText [(ngModel)]="spec.electrical_specs.max_wattage" placeholder="e.g. 1500W" class="w-full" />
                  </div>
                  <div class="flex flex-col gap-1">
                      <label class="text-xs font-medium text-surface-500">Frequency</label>
                      <input pInputText [(ngModel)]="spec.electrical_specs.frequency" placeholder="e.g. 60Hz" class="w-full" />
                  </div>
              </div>
          </div>
        </div>

        <ng-template #footer>
            <p-button label="Cancel" icon="pi pi-times" text (click)="editDialog = false" />
            <p-button label="Update Specs" icon="pi pi-check" (click)="updateSpecs()" [disabled]="!spec.model || !spec.actual_price" />
        </ng-template>
    </p-dialog>

    <p-dialog [(visible)]="mediaDialog" [header]="'Select Media Type'" [modal]="true" [style]="{ width: '400px' }">
        <div class="flex flex-col items-center gap-4 py-4">
            <p class="font-medium text-surface-600 dark:text-surface-400">What are you interested to upload?</p>

            <div class="flex gap-3">
                <p-chip
                    label="Images"
                    icon="pi pi-image"
                    class="cursor-pointer hover:opacity-80"
                    (click)="navigateToUpload('image')"
                    styleClass="bg-primary text-primary-contrast p-2" />

                <p-chip
                    label="Videos"
                    icon="pi pi-video"
                    class="cursor-pointer hover:opacity-80"
                    (click)="navigateToUpload('video')"
                    styleClass="bg-primary text-primary-contrast p-2" />
            </div>
        </div>
    </p-dialog>

    <p-dialog [(visible)]="imageUploadDialog" header="Upload Images" [modal]="true" [style]="{ width: '550px' }">

        <div class="flex flex-col gap-4">
            <p-fileUpload
                mode="basic"
                chooseLabel="Select or Drag Images"
                [multiple]="true"
                accept="image/*"
                customUpload="true"
                (onSelect)="onFileSelect($event, 'image')"
                styleClass="w-full">
            </p-fileUpload>

            <div class="mt-4 border-t border-surface-200 pt-2">
                <div *ngFor="let item of imageFiles; let i = index" class="flex items-center gap-4 py-4 border-b border-surface-100">

                    <img [src]="item.preview" class="w-14 h-12 rounded object-cover border border-surface-200" alt="preview">

                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-sm font-semibold truncate text-surface-900">{{ item.file.name }}</span>

                            <span [ngClass]="{
                                'bg-orange-500': item.status === 'pending',
                                'bg-blue-500': item.status === 'uploading',
                                'bg-green-600': item.status === 'completed',
                                'bg-red-500': item.status === 'failed'
                            }" class="text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                                {{ item.status }}
                            </span>
                        </div>

                        <div class="text-xs text-surface-500 mb-2">
                            {{ (item.file.size / 1024).toFixed(3) }} KB
                        </div>

                        <div *ngIf="item.status === 'uploading' || item.status === 'completed'" class="w-full bg-surface-100 h-1.5 rounded-full overflow-hidden">
                            <div class="bg-primary h-full transition-all duration-300" [style.width.%]="item.progress"></div>
                        </div>

                        <small *ngIf="item.status === 'failed'" class="text-red-500 font-medium">
                            {{ item.errorMessage || 'Upload failed' }}
                        </small>
                    </div>

                    <button type="button"
                            class="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            (click)="removeFile(i, 'image')">
                        <i class="pi pi-times"></i>
                    </button>
                </div>
            </div>
        </div>

        <ng-template pTemplate="footer">
          <div class="flex flex-col w-full gap-4 pt-2">

              <div class="flex items-center justify-between border-b border-surface-200 pb-2">
                  <div class="flex items-center gap-2 text-surface-500 font-semibold" *ngIf="imageStats.total > 0">
                      <i class="pi pi-file"></i>
                      <span>Total: {{ imageStats.total }}</span>
                  </div>

                  <div class="flex gap-4 text-sm">
                      <span class="flex items-center text-green-600 font-bold" *ngIf="imageStats.completed > 0">
                          <i class="pi pi-check-circle"></i>
                          <span class="ml-2">{{ imageStats.completed }} Success</span>
                      </span>
                      <span class="flex items-center text-red-600 font-bold" *ngIf="imageStats.failed > 0">
                          <i class="pi pi-exclamation-circle"></i>
                          <span class="ml-2">{{ imageStats.failed }} Failed</span>
                      </span>
                  </div>
              </div>

              <div class="flex justify-end gap-2">
                  <p-button label="Cancel"
                            (click)="resetUpload('image')"
                            styleClass="p-button-text p-button-secondary">
                  </p-button>

                  <p-button *ngIf="imageStats.failed > 0"
                            label="Retry Failed"
                            icon="pi pi-refresh"
                            styleClass="p-button-text p-button-warning"
                            (click)="retryFailed('image')">
                  </p-button>

                  <p-button *ngIf="imageStats.completed > 0"
                            label="Clear Completed"
                            icon="pi pi-trash"
                            styleClass="p-button-text p-button-danger"
                            (click)="clearCompleted('image')">
                  </p-button>

                  <p-button label="Upload"
                            icon="pi pi-upload"
                            (click)="uploadAll('image')"
                            [disabled]="imageStats.pending === 0 && imageStats.failed === 0">
                  </p-button>
              </div>
          </div>
      </ng-template>
    </p-dialog>

    <p-dialog [(visible)]="videoUploadDialog" header="Upload Videos" [modal]="true" [style]="{ width: '550px' }">
        <div class="flex flex-col gap-4">
            <p-fileUpload
                mode="basic"
                chooseLabel="Select or Drag Videos"
                [multiple]="true"
                accept="video/*"
                customUpload="true"
                (onSelect)="onFileSelect($event, 'video')"
                styleClass="w-full">
            </p-fileUpload>

            <div class="mt-4 border-t border-surface-200 pt-2">
                <div *ngFor="let item of videoFiles; let i = index" class="flex items-center gap-4 py-4 border-b border-surface-100">

                    <div class="w-14 h-12 bg-surface-100 flex items-center justify-center rounded border border-surface-200">
                        <i class="pi pi-video text-xl text-surface-500"></i>
                    </div>

                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-sm font-semibold truncate text-surface-900">{{ item.file.name }}</span>
                            <span [ngClass]="{
                                'bg-orange-500': item.status === 'pending',
                                'bg-blue-500': item.status === 'uploading',
                                'bg-green-600': item.status === 'completed',
                                'bg-red-500': item.status === 'failed'
                            }" class="text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                                {{ item.status }}
                            </span>
                        </div>

                        <div class="text-xs text-surface-500 mb-2">
                            {{ (item.file.size / (1024 * 1024)).toFixed(2) }} MB
                        </div>

                        <small *ngIf="item.status === 'failed'" class="text-red-500 font-medium">
                            {{ item.errorMessage || 'Upload failed' }}
                        </small>

                        <div *ngIf="item.status === 'uploading' || item.status === 'completed'" class="w-full bg-surface-100 h-1.5 rounded-full overflow-hidden">
                            <div class="bg-primary h-full transition-all duration-300" [style.width.%]="item.progress"></div>
                        </div>
                    </div>

                    <button type="button"
                            class="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            (click)="removeFile(i, 'video')">
                        <i class="pi pi-times"></i>
                    </button>
                </div>
            </div>
        </div>

        <ng-template pTemplate="footer">
          <div class="flex flex-col w-full gap-4 pt-2">

              <div class="flex items-center justify-between border-b border-surface-200 pb-2">
                  <div class="flex items-center gap-2 text-surface-500 font-semibold" *ngIf="videoStats.total > 0">
                      <i class="pi pi-file"></i>
                      <span>Total: {{ videoStats.total }}</span>
                  </div>

                  <div class="flex gap-4 text-sm">
                      <span class="flex items-center text-green-600 font-bold" *ngIf="videoStats.completed > 0">
                          <i class="pi pi-check-circle"></i>
                          <span class="ml-2">{{ videoStats.completed }} Success</span>
                      </span>
                      <span class="flex items-center text-red-600 font-bold" *ngIf="videoStats.failed > 0">
                          <i class="pi pi-exclamation-circle"></i>
                          <span class="ml-2">{{ videoStats.failed }} Failed</span>
                      </span>
                  </div>
              </div>

              <div class="flex justify-end gap-2">
                  <p-button label="Cancel"
                            (click)="resetUpload('video')"
                            styleClass="p-button-text p-button-secondary">
                  </p-button>

                  <p-button *ngIf="videoStats.failed > 0"
                            label="Retry Failed"
                            icon="pi pi-refresh"
                            styleClass="p-button-text p-button-warning"
                            (click)="retryFailed('video')">
                  </p-button>

                  <p-button *ngIf="videoStats.completed > 0"
                            label="Clear Completed"
                            icon="pi pi-trash"
                            styleClass="p-button-text p-button-danger"
                            (click)="clearCompleted('video')">
                  </p-button>

                  <p-button label="Upload"
                            icon="pi pi-upload"
                            (click)="uploadAll('video')"
                            [disabled]="videoStats.pending === 0 && videoStats.failed === 0">
                  </p-button>
              </div>
          </div>
      </ng-template>
    </p-dialog>

    <p-dialog
        [(visible)]="mediaPreviewDialog"
        [header]="previewType === 'image' ? 'Image Gallery' : 'Video Gallery'"
        [modal]="true"
        [style]="{ width: '70vw' }"
        [breakpoints]="{ '960px': '90vw' }"
        (onHide)="previewMedia = []">

        <p-galleria
            *ngIf="previewType === 'image' && previewMedia.length > 0"
            [value]="previewMedia"
            [responsiveOptions]="galleriaResponsiveOptions"
            [containerStyle]="{ 'width': '100%' }"
            [numVisible]="5"
            [circular]="true"
            [showItemNavigators]="true">

            <ng-template #item let-item>
                <div class="relative group w-full">
                    <img [src]="item.image" style="width: 100%; display: block; border-radius: 8px;" />

                    <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                            pButton
                            type="button"
                            icon="pi pi-trash"
                            class="p-button-rounded p-button-danger shadow-md"
                            (click)="confirmMediaDelete($event, item.id, 'image')"
                            pTooltip="Delete Image"
                            tooltipPosition="left">
                        </button>
                    </div>
                </div>
            </ng-template>

            <ng-template #thumbnail let-item>
                <img [src]="item.image" style="width: 60px; display: block; border-radius: 4px;" />
            </ng-template>
        </p-galleria>

        <div *ngIf="previewType === 'video' && previewMedia.length > 0" class="grid grid-cols-12 gap-4">

          <div class="col-span-12 md:col-span-8 bg-black rounded-lg overflow-hidden flex items-center justify-center" style="min-height: 400px;">
              <video #mainVideoPlayer controls class="w-full max-h-[500px]" [src]="selectedVideo?.video">
                  Your browser does not support the video tag.
              </video>
          </div>

          <div class="col-span-12 md:col-span-4 flex flex-col gap-2 overflow-y-auto" style="max-height: 500px;">
              <div *ngFor="let vid of previewMedia"
                   (click)="selectVideo(vid)"
                   [ngClass]="{'border-primary bg-primary-50': selectedVideo?.id === vid.id, 'border-surface-200': selectedVideo?.id !== vid.id}"
                   class="flex items-center gap-3 p-2 border rounded-md cursor-pointer hover:bg-surface-100 transition-colors">

                  <div class="w-16 h-12 bg-surface-900 flex items-center justify-center rounded flex-shrink-0">
                      <i class="pi pi-video text-white"></i>
                  </div>

                  <div class="flex-1 min-w-0">
                      <div class="text-xs font-semibold truncate text-surface-900">Video #{{vid.id}}</div>
                      <div class="text-[10px] text-surface-500">Click to play</div>
                  </div>

                  <div class="flex items-center gap-2">
                      <i *ngIf="selectedVideo?.id === vid.id" class="pi pi-play-circle text-primary group-hover:hidden"></i>

                      <button
                          pButton
                          type="button"
                          icon="pi pi-trash"
                          class="p-button-rounded p-button-text p-button-danger hidden group-hover:flex"
                          style="width: 2rem; height: 2rem;"
                          (click)="$event.stopPropagation(); confirmMediaDelete($event, vid.id, 'video')">
                      </button>
                  </div>

              </div>
          </div>
      </div>

        <div *ngIf="previewMedia.length === 0" class="flex flex-col items-center justify-center py-12 text-surface-400">
            <i class="pi pi-images text-5xl mb-4"></i>
            <p>No media files found for this product.</p>
        </div>
    </p-dialog>

    <p-confirmdialog [style]="{ width: '450px' }" />
    `,
    providers: [MessageService, ProductService, ConfirmationService]
})
export class Products implements OnInit {
    productDialog: boolean = false;
    products = signal<Product[]>([]);
    media = signal<ProductMedia[]>([]);
    categories = signal<Category[]>([]);
    product!: Product;
    selectedProducts!: Product[] | null;
    submitted: boolean = false;
    cols!: Column[];
    exportColumns!: ExportColumn[];

    specs = signal<Spec[]>([]);
    selectedSpecs: Spec[] | null = null;

    currentSpec: Spec | null = null;

    viewDialog: boolean = false;
    editDialog: boolean = false;
    mediaDialog: boolean = false;
    imageUploadDialog: boolean = false;
    videoUploadDialog: boolean = false;

    files: UploadFile[] = [];
    imageFiles: UploadFile[] = [];
    videoFiles: UploadFile[] = [];

    mediaPreviewDialog: boolean = false;
    previewType: 'image' | 'video' = 'image';
    previewMedia: any[] = [];
    selectedVideo: any = null;

    @ViewChild('dt') dt!: Table;

    constructor(
        private productService: ProductService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    specDialog: boolean = false;
    spec: Spec = this.resetSpec();
    setupData = signal<{ [key: string]: any[] }>({
        brands: [], resolutions: [], panels: [], services: [], screens: [], connectivities: [], conditions: []
    });

    resetSpec(): Spec {
        return {
            product: 0,
            actual_price: '',
            discounted_price: '',
            model: '',
            color: '',
            condition: '',
            supported_internet_services: [],
            electrical_specs: { voltage: '', max_wattage: '', frequency: '' },
            product_connectivity: [],
            smart_features: false
        };
    }

    colors = [
        { name: 'Black', id: 'black' },
        { name: 'Space Gray', id: 'slategray' },
        { name: 'Silver', id: 'silver' },
        { name: 'White', id: 'white' },
        { name: 'Champagne Gold', id: 'bisque' },
        { name: 'Green', id: 'forestgreen' },
        { name: 'Blue', id: 'mediumblue' },
        { name: 'Red', id: 'crimson' },
        { name: 'Yellow', id: 'gold' },
        { name: 'Purple', id: 'rebeccapurple' },
        { name: 'Gold Plated', id: 'goldenrod' },
        { name: 'Copper', id: 'peru' },
        { name: 'Orange', id: 'orange' },
        { name: 'Transparent/Clear', id: 'aliceblue' }
    ];

    ngOnInit() {
        this.loadProducts();
        this.loadSpecsMedia();
        this.loadCategories();
        this.loadSpecs();
        this.loadSpecSetups()
        this.cols = [
            { field: 'name', header: 'Name' },
            { field: 'description', header: 'Description' },
            { field: 'category', header: 'Category' },
            { field: 'action', header: 'Action' }
        ];
        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }

    galleriaResponsiveOptions: any[] = [
        { breakpoint: '1024px', numVisible: 5 },
        { breakpoint: '768px', numVisible: 3 },
        { breakpoint: '560px', numVisible: 1 }
    ];

    loadProducts() {
        this.productService.getProducts().subscribe({
            next: (data) => this.products.set(data),
            error: () => this.showError('Could not load products')
        });
    }

    loadSpecsMedia() {
        this.productService.getProductMedia().subscribe({
            next: (data) => this.media.set(data),
            error: () => this.showError('Could not load Media')
        });
    }

    loadSpecSetups() {
      const endpoints = {
          brands: 'brands',
          resolutions: 'resolutions',
          panels: 'panel-types',
          services: 'internet-services',
          screens: 'screen-sizes',
          connectivities: 'connectivity',
          conditions: 'product-conditions'
      };

      forkJoin(
          Object.entries(endpoints).reduce((acc, [key, url]) => {
              acc[key] = this.productService.getSetupData(url);
              return acc;
          }, {} as any)
      ).subscribe(data => this.setupData.set(data as any));
    }

    openSpecDialog(product: Product) {
        this.spec = this.resetSpec();
        this.spec.product = product.id!;
        this.loadSpecSetups();
        this.specDialog = true;
    }

    addConnectivity() {
        this.spec.product_connectivity.push({ connectivity: 0, connectivity_count: 1 });
    }

    addToUpdateConnectivity() {

        if (!this.spec.product_connectivity) {
            this.spec.product_connectivity = [];
        }

        this.spec.product_connectivity.push({
            connectivity: null as any,
            connectivity_count: 1
        });
    }

    removeConnectivity(index: number) {
        this.spec.product_connectivity.splice(index, 1);
    }

    openNew() {
        this.product = { is_active: true, category: 0 };
        this.submitted = false;
        this.productDialog = true;
    }

    editProduct(product: Product) {
        this.product = { ...product };
        this.productDialog = true;
    }

    hideDialog() {
        this.productDialog = false;
        this.submitted = false;
    }

    saveProduct() {
        this.submitted = true;

        if (this.product.name?.trim()) {
            if (this.product.id) {
                this.productService.updateProduct(this.product).subscribe({
                    next: () => {
                        this.loadProducts();
                        this.loadSpecsMedia();
                        this.showSuccess('Product Updated');
                        this.productDialog = false;
                    },
                    error: () => this.showError('Update failed')
                });
            } else {
                this.productService.createProduct(this.product).subscribe({
                    next: () => {
                        this.loadProducts();
                        this.loadSpecsMedia();
                        this.showSuccess('Product Created');
                        this.productDialog = false;
                    },
                    error: () => this.showError('Creation failed')
                });
            }
            this.product = {};
        }
    }

    deleteProduct(product: Product) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${product.name}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.productService.deleteProduct(product.id!).subscribe({
                    next: () => {
                        this.products.set(this.products().filter((val) => val.id !== product.id));
                        this.loadProducts();
                        this.loadSpecs();
                        this.loadSpecsMedia();
                        this.showSuccess('Product Deleted');
                    },
                    error: (err) => this.showBackendError(err)
                });
            }
        });
    }

    deleteSelectedProducts() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected products?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const ids = this.selectedProducts?.map(p => p.id!) || [];
                const requests = ids.map(id => this.productService.deleteProduct(id));

                forkJoin(requests).subscribe({
                    next: () => {
                        this.loadProducts();
                        this.loadSpecs();
                        this.loadSpecsMedia()
                        this.selectedProducts = null;
                        this.showSuccess('Products Deleted');
                    },
                    error: (err) => this.showBackendError(err)
                });
            }
        });
    }

    saveSpecs() {

      const isValid = this.spec.model &&
                      this.spec.actual_price !== undefined &&
                      this.spec.discounted_price !== undefined;

      if (isValid) {
        this.productService.saveSpecs(this.spec).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Specifications Saved',
              life: 3000
            });
            this.specDialog = false;
            this.loadSpecs();
            this.loadSpecsMedia();
          },
          error: (err) => {
            const errorData = err.error;

            if (errorData && typeof errorData === 'object') {

              if (errorData.price) {
                this.DisplayError('Price Error', errorData.price);
              }

              if (errorData.model) {
                this.DisplayError('Model number Error', errorData.model);
              }

              if (errorData.non_field_errors) {
                this.DisplayError('System Error', errorData.non_field_errors);
              }
            } else {
              this.DisplayError('Network Error', 'Oops! Something went wrong. Please try again later.');
            }
          }
        });
      }
    }


    DisplayError(summary: string, detail: string | string[]) {
      this.messageService.add({
        severity: 'error',
        summary: summary,
        detail: Array.isArray(detail) ? detail.join(', ') : detail,
        life: 7000
      });
    }


    onSmartToggleChange(event: any) {
        if (!event.checked) {

            this.spec.supported_internet_services = [];
        }
    }

    onGlobalFilter(table: Table, event: Event) {
        const query = (event.target as HTMLInputElement).value;
        table.filterGlobal(query, 'contains');
    }

    loadCategories() {
        this.productService.getCategories().subscribe({
            next: (data) => this.categories.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Load categories failed' })
        });
    }

    loadSpecs() {
        this.productService.getSpecs().subscribe({
            next: (data) => this.specs.set(data),
            error: (err) => this.showBackendError(err)
        });
    }

    deleteSpec(spec: Spec) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete the specs for model ${spec.model}?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.productService.deleteSpec(spec.id!).subscribe({
                    next: () => {
                        this.specs.set(this.specs().filter(s => s.id !== spec.id));
                        this.loadProducts();
                        this.loadSpecs();
                        this.loadSpecsMedia()
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Specification removed' });
                    },
                    error: (err) => this.showBackendError(err)
                });
            }
        });
    }

    deleteSelectedSpecs() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete all selected specifications?',
            header: 'Bulk Delete',
            icon: 'pi pi-trash',
            accept: () => {
                const ids = this.selectedSpecs?.map(s => s.id!) || [];
                const requests = ids.map(id => this.productService.deleteSpec(id));

                forkJoin(requests).subscribe({
                    next: () => {
                        this.loadSpecs();
                        this.selectedSpecs = null;
                        this.loadProducts();
                        this.loadSpecs();
                        this.loadSpecsMedia();
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Items Deleted' });
                    },
                    error: (err) => this.showBackendError(err)
                });
            }
        });
    }

    private showBackendError(err: any) {
        this.messageService.add({
            severity: 'error',
            summary: 'Deletion Error',
            detail: err.error?.detail || 'Action failed',
            life: 7000
        });
    }

    getCategoryName(id?: number): string {
        const cat = this.categories().find(c => c.id === id);
        return cat ? cat.name : 'Uncategorized';
    }

    getBrandName(id?: number): string {
        return this.setupData()['brands'].find(x => x.id === id)?.name || 'Unknown';
    }

    getConditionName(id?: number): string {
        return this.setupData()['conditions'].find(x => x.id === id)?.name || 'New';
    }

    getConnectivityName(id?: number): string {
        return this.setupData()['connectivities'].find(x => x.id === id)?.name || 'Generic';
    }

    getResolutionName(id?: number): string {
        return this.setupData()['resolutions'].find(x => x.id === id)?.name || 'N/A';
    }

    getScreenName(id?: number): string {
        return this.setupData()['screens'].find(x => x.id === id)?.name || 'N/A';
    }

    getPanelName(id?: number): string {
        return this.setupData()['panels'].find(x => x.id === id)?.name || 'N/A';
    }

    getServiceName(id: number): string {
        const service = this.setupData()['supported_internet_services'].find(s => s.id === id);
        return service ? service.name : `Service ${id}`;
    }

    exportCSV() {
        this.dt.exportCSV();
    }

    private showSuccess(msg: string) {
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: msg, life: 3000 });
    }

    private showError(msg: string) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 3000 });
    }

    viewSpec(spec: Spec) {
        this.currentSpec = { ...spec };
        this.viewDialog = true;
    }

    editSpec(spec: Spec) {

        this.spec = JSON.parse(JSON.stringify(spec));
        this.currentSpec = JSON.parse(JSON.stringify(spec));
        this.editDialog = true;
    }


    updateSpecs() {

        const hasConnectivityError = this.spec.product_connectivity?.some(c => c.connectivity_count < 1);

        const isValid = this.spec.model &&
                        this.spec.actual_price !== undefined &&
                        !hasConnectivityError;

        if (!isValid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation Error',
                detail: 'Please ensure all fields are filled and connectivity counts are at least 1.'
            });
            return;
        }

        this.productService.updateSpec(this.spec).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Specifications Updated Successfully',
                    life: 3000
                });
                this.editDialog = false;
                this.loadSpecs();
                this.loadSpecsMedia();
            },
            error: (err) => {
                const errorData = err.error;

                if (errorData && typeof errorData === 'object') {

                    if (errorData.actual_price || errorData.discounted_price) {
                        this.DisplayError('Pricing Error', errorData.actual_price || errorData.discounted_price);
                    }

                    if (errorData.model) {
                        this.DisplayError('Model Error', errorData.model);
                    }

                    if (errorData.price) {
                        this.DisplayError('Price Error', errorData.price);
                    }

                    if (errorData.product_connectivity) {
                        this.DisplayError('Connectivity Error', errorData.product_connectivity);
                    }

                    if (errorData.non_field_errors) {
                        this.DisplayError('System Error', errorData.non_field_errors);
                    }
                } else {
                    this.DisplayError('Network Error', 'Oops! Something went wrong. Please try again later.');
                }
            }
        });
    }

    openMediaDialog(spec: any) {
        this.currentSpec = { ...spec };
        this.mediaDialog = true;
    }

    navigateToUpload(type: 'image' | 'video') {
        this.mediaDialog = false;
        if (type === 'image') {
            this.imageUploadDialog = true;
        } else {
            this.videoUploadDialog = true;
        }
    }

    onFileSelect(event: any, type: 'image' | 'video') {
        const files: FileList | File[] = event.currentFiles || event.target.files;

        if (!files || files.length === 0) return;

        Array.from(files).forEach((file: File) => {
            const newUploadItem: UploadFile = {
                file: file,
                status: 'pending',
                progress: 0,
                preview: ''
            };

            if (type === 'image' && file.type.startsWith('image/')) {
                newUploadItem.preview = URL.createObjectURL(file);
                this.imageFiles.push(newUploadItem);
            }

            else if (type === 'video' && file.type.startsWith('video/')) {
                this.videoFiles.push(newUploadItem);
            }
        });

        if (event.currentFiles) {
            event.currentFiles.length = 0;
        }
    }

    onFilesSelected(event: any) {
        const selectedFiles = event.target.files || event.dataTransfer.files;
        for (let file of selectedFiles) {
            this.files.push({
                file: file,
                status: 'pending',
                progress: 0
            });
        }
    }

    removeFile(index: number, type: 'image' | 'video') {
        if (type === 'image') {

            if (this.imageFiles[index].preview) {
                URL.revokeObjectURL(this.imageFiles[index].preview!);
            }
            this.imageFiles.splice(index, 1);
        } else {
            this.videoFiles.splice(index, 1);
        }
    }

    uploadAll(type: 'image' | 'video') {
        const spec = this.currentSpec;

        if (!spec || spec.id === undefined) {
            console.error("Cannot upload: Missing product specification ID.");
            return;
        }

        const targetList = type === 'image' ? this.imageFiles : this.videoFiles;

        targetList.forEach((fileItem: UploadFile) => {
            if (fileItem.status === 'completed' || fileItem.status === 'uploading') return;

            fileItem.status = 'uploading';
            fileItem.progress = 0;

            const formData = new FormData();
            formData.append('product', spec.id!.toString());

            const upload$ = type === 'image'
                ? (formData.append('image', fileItem.file), this.productService.saveSpecsImages(formData))
                : (formData.append('video', fileItem.file), this.productService.saveSpecsVideos(formData));

            upload$.subscribe({
                next: (event: HttpEvent<any>) => {
                    if (event.type === HttpEventType.UploadProgress && event.total) {
                        fileItem.progress = Math.round((100 * event.loaded) / event.total);
                    } else if (event.type === HttpEventType.Response) {
                        fileItem.status = 'completed';
                        fileItem.progress = 100;
                    }
                    this.loadSpecsMedia();
                },
                error: (err) => {
                    fileItem.status = 'failed';
                    fileItem.errorMessage = err.error?.image?.[0] || err.error?.video?.[0] || 'Upload failed';
                }
            });
        });
    }

    get imageStats() {
        return {
            total: this.imageFiles.length,
            completed: this.imageFiles.filter(f => f.status === 'completed').length,
            failed: this.imageFiles.filter(f => f.status === 'failed').length,
            pending: this.imageFiles.filter(f => f.status === 'pending' || f.status === 'uploading').length
        };
    }

    get videoStats() {
        return {
            total: this.videoFiles.length,
            completed: this.videoFiles.filter(f => f.status === 'completed').length,
            failed: this.videoFiles.filter(f => f.status === 'failed').length,
            pending: this.videoFiles.filter(f => f.status === 'pending' || f.status === 'uploading').length
        };
    }

    clearCompleted(type: 'image' | 'video') {
        if (type === 'image') {
            this.imageFiles = this.imageFiles.filter(f => f.status !== 'completed');
        } else {
            this.videoFiles = this.videoFiles.filter(f => f.status !== 'completed');
        }
    }

    retryFailed(type: 'image' | 'video') {
        const targetList = type === 'image' ? this.imageFiles : this.videoFiles;

        const failedFiles = targetList.filter(file => file.status === 'failed');

        failedFiles.forEach((fileItem: UploadFile) => {

            fileItem.status = 'uploading';
            fileItem.progress = 0;
            fileItem.errorMessage = undefined;

            this.uploadAll(type);
        });
    }

    resetUpload(type: 'image' | 'video') {
        if (type === 'image') {

            this.imageFiles.forEach(file => {
                if (file.preview) URL.revokeObjectURL(file.preview);
            });
            this.imageFiles = [];
            this.imageUploadDialog = false;
        } else {
            this.videoFiles = [];
            this.videoUploadDialog = false;
        }

        if (!this.imageUploadDialog && !this.videoUploadDialog) {
            this.currentSpec = null;
        }
    }


    openMediaPreviewDialog(spec: ProductMedia, type: 'image' | 'video') {
        this.previewType = type;
        this.previewMedia = type === 'image' ? (spec.images || []) : (spec.videos || []);

        if (type === 'video' && this.previewMedia.length > 0) {
            this.selectedVideo = this.previewMedia[0];
        }

        this.mediaPreviewDialog = true;
    }

    selectVideo(video: any) {
        this.selectedVideo = video;
        // Optional: Programmatically force the video player to reload/play
    }

    resetPreview() {
        this.previewMedia = [];
        this.selectedVideo = null;
        this.mediaPreviewDialog = false;
    }

    deleteMedia(fileId: number, type: 'image' | 'video') {

        const delete$ = type === 'image'
            ? this.productService.deleteSpecImage(fileId)
            : this.productService.deleteSpecVideo(fileId);

        delete$.subscribe({
            next: () => {

                this.media.update(products => products.map(product => {
                    if (product.id === this.currentSpec?.id) {
                        return {
                            ...product,
                            images: type === 'image' ? product.images.filter(img => img.id !== fileId) : product.images,
                            videos: type === 'video' ? product.videos.filter(vid => vid.id !== fileId) : product.videos
                        };
                    }
                    return product;

                }));

                this.previewMedia = this.previewMedia.filter(item => item.id !== fileId);

                if (type === 'video' && this.selectedVideo?.id === fileId) {
                    this.selectedVideo = this.previewMedia.length > 0 ? this.previewMedia[0] : null;
                }

                this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'File removed successfully' });
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete file' });
            }
        });
    }

    confirmMediaDelete(event: Event, fileId: number, type: 'image' | 'video') {
      this.confirmationService.confirm({
          target: event.target as EventTarget,
          message: 'Are you sure you want to permanently delete this file?',
          header: 'Confirm Deletion',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Yes, Delete',
          rejectLabel: 'Cancel',
          acceptButtonStyleClass: 'p-button-danger p-button-text',
          rejectButtonStyleClass: 'p-button-secondary p-button-text',
          accept: () => {
              this.deleteMedia(fileId, type);
              this.loadSpecsMedia();
          }
      });
  }

}
