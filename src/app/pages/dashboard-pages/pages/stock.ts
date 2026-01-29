import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InventoryService } from '../../../shared/services/inventory-service';
import { StockData } from '../../../shared/interfaces/stock';

@Component({
    selector: 'app-stock',
    standalone: true,
    imports: [
        CommonModule, TableModule, FormsModule, ButtonModule, ToastModule,
        ToolbarModule, InputTextModule, InputNumberModule, DialogModule,
        TagModule, IconFieldModule, InputIconModule, ConfirmDialogModule,
        AutoCompleteModule
    ],
    providers: [MessageService, ConfirmationService, InventoryService],
    template: `
        <p-toast />

        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="Add Stock" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
                <p-button severity="danger" label="Delete" icon="pi pi-trash" outlined (onClick)="deleteSelectedStocks()" [disabled]="!selectedStocks?.length" />
            </ng-template>
            <ng-template #end>
                <p-button label="Export CSV" icon="pi pi-upload" severity="secondary" (onClick)="dt.exportCSV()" />
            </ng-template>
        </p-toolbar>

        <p-table #dt [value]="stocks()" [rows]="10" [paginator]="true" [globalFilterFields]="['product_name', 'model', 'sku', 'location_details.name']"
                 [(selection)]="selectedStocks" [rowHover]="true" dataKey="id" [showCurrentPageReport]="true"
                 currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Inventory Stock Levels</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search Stock..." />
                    </p-iconfield>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th style="width: 3rem"><p-tableHeaderCheckbox /></th>
                    <th pSortableColumn="product_name">Product <p-sortIcon field="product_name" /></th>
                    <th>Location</th>
                    <th pSortableColumn="quantity_in_stock">Quantity <p-sortIcon field="quantity_in_stock" /></th>
                    <th pSortableColumn="quantity_in_stock">Safety Level<p-sortIcon field="safety_stock_level" /></th>
                    <th pSortableColumn="quantity_in_stock">Last restock <p-sortIcon field="last_restock_date" /></th>
                    <th>Status</th>
                    <th style="min-width: 8rem">Actions</th>
                </tr>
            </ng-template>
            <ng-template #body let-stock>
                <tr>
                    <td><p-tableCheckbox [value]="stock" /></td>
                    <td>
                        <div class="flex flex-col">
                            <span class="font-bold">{{ stock.product_name }}</span>
                            <small class="text-surface-500 mt-1">{{ stock.model }}</small>
                        </div>
                    </td>
                    <td>
                      <div class="flex flex-col">
                        <span class="font-bold">{{ stock.location_details?.name }}</span>
                        <small class="text-surface-500 mt-1">{{ stock.location_details?.address }}</small>
                      </div>
                    </td>
                    <td>{{ stock.quantity_in_stock }}</td>
                    <td>{{ stock.safety_stock_level }}</td>
                    <td>
                        {{ (stock.last_restock_date | date:'MMM d, y h:mm a') || 'NULL' }}
                    </td>
                    <td>
                        <p-tag [value]="stock.is_low_stock ? 'LOW STOCK' : 'IN STOCK'"
                               [severity]="stock.is_low_stock ? 'warn' : 'success'" />
                    </td>
                    <td>
                        <p-button icon="pi pi-pencil" [rounded]="true" [outlined]="true" (onClick)="editStock(stock)" class="mr-2" />
                        <p-button icon="pi pi-trash" [rounded]="true" [outlined]="true" severity="danger" (onClick)="deleteStock(stock)" />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="stockDialog" [style]="{ width: '500px' }" header="Stock Details" [modal]="true">
            <div class="flex flex-col gap-4">
            <div>
              <label class="block font-bold mb-2">Product (Model or Name)</label>
              <p-autocomplete
                  [(ngModel)]="selectedProduct"
                  [suggestions]="filteredProducts"
                  (completeMethod)="filterProduct($event)"
                  optionLabel="model"
                  field="model"
                  placeholder="Search model/name..."
                  [forceSelection]="true"
                  fluid>
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

                        </div>
                    </div>
                </ng-template>
              </p-autocomplete>
              </div>

              <div>
              <label class="block font-bold mb-2">Location</label>
              <p-autocomplete
                  [(ngModel)]="selectedLocation"
                  [suggestions]="filteredLocations"
                  (completeMethod)="filterLocation($event)"
                  field="name"
                  placeholder="Search location..."
                  optionLabel="name"
                  [forceSelection]="true"
                  fluid>
                  <ng-template #item let-loc>
                      <div class="flex items-center gap-2">
                          <i class="pi pi-map-marker text-primary"></i>
                          <span>{{ loc.name }}</span>
                          <small class="text-surface-500">({{ loc.code }})</small>
                      </div>
                  </ng-template>
              </p-autocomplete>
              </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block font-bold mb-2">Quantity in Stock</label>
                        <p-inputnumber [(ngModel)]="stock.quantity_in_stock" [showButtons]="true" fluid />
                    </div>
                    <div>
                        <label class="block font-bold mb-2">Safety Level</label>
                        <p-inputnumber [(ngModel)]="stock.safety_stock_level" [showButtons]="true" fluid />
                    </div>
                </div>
            </div>
            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (onClick)="hideDialog()" />
                <p-button label="Save Stock" icon="pi pi-check" (onClick)="saveStock()" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
    `
})
export class Stock implements OnInit {
    stocks = signal<StockData[]>([]);
    stockDialog: boolean = false;
    stock: any = {};
    selectedStocks: any[] | null = null;
    submitted: boolean = false;

    selectedProduct: any;
    filteredProducts: any[] = [];
    selectedLocation: any;
    filteredLocations: any[] = [];

    @ViewChild('dt') dt!: Table;

    constructor(
        private inventoryService: InventoryService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadStocks();
    }

    loadStocks() {
        this.inventoryService.getStocks().subscribe(data => this.stocks.set(data));
    }

    filterProduct(event: any) {
        this.inventoryService.searchProducts(event.query).subscribe(data => this.filteredProducts = data);
    }

    filterLocation(event: any) {
        this.inventoryService.searchLocations(event.query).subscribe(data => this.filteredLocations = data);
    }

    openNew() {
        this.stock = { quantity_in_stock: 0, safety_stock_level: 0 };
        this.selectedProduct = null;
        this.selectedLocation = null;
        this.submitted = false;
        this.stockDialog = true;
    }

    editStock(stock: any) {
        this.stock = { ...stock };
        this.selectedProduct = { product_name: stock.product_name, id: stock.product, model: stock.model };
        this.selectedLocation = stock.location_details;
        this.stockDialog = true;
    }

    saveStock() {
        this.submitted = true;

        const payload = {
            product: this.selectedProduct?.id,
            location: this.selectedLocation?.id,
            quantity_in_stock: this.stock.quantity_in_stock,
            safety_stock_level: this.stock.safety_stock_level
        };

        if (!payload.product || !payload.location) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Product and Location are required' });
            return;
        }

        if (this.stock.id) {
            this.inventoryService.updateStock(this.stock.id, payload).subscribe({
                next: () => this.finishSave('Stock Updated'),
                error: (err) => this.handleError(err)
            });
        } else {
            this.inventoryService.createStock(payload).subscribe({
                next: () => this.finishSave('Stock Created'),
                error: (err) => this.handleError(err)
            });
        }
    }

    handleError(err: any) {
        if (err.status === 400) {
            const errorData = err.error;

            if (errorData.location) {
                this.showError('Duplicate Entry', errorData.location[0]);
            }
            else if (errorData.quantity_in_stock) {
                this.showError('Invalid Quantity', errorData.quantity_in_stock[0]);
            }

            else {
                this.showError('Error', 'Something went wrong, please try again later.');
            }
        }
    }


    private showError(summary: string, detail: string) {
        this.messageService.add({
            severity: 'error',
            summary: summary,
            detail: detail,
            life: 5000
        });
    }


    private finishSave(detail: string) {
        this.messageService.add({ severity: 'success', summary: 'Successful', detail });
        this.loadStocks();
        this.stockDialog = false;
    }

    deleteStock(stock: any) {
        this.confirmationService.confirm({
            message: `Delete stock record for ${stock.product_name}?`,
            accept: () => {
                this.inventoryService.deleteStock(stock.id).subscribe(() => {
                    this.loadStocks();
                    this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Stock record removed' });
                });
            }
        });
    }

    deleteSelectedStocks() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected stock records?',
            header: 'Confirm Bulk Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                // Option A: If your API supports bulk delete, call it once.
                // Option B: If not, we loop through the selections.
                if (this.selectedStocks) {
                    const deleteRequests = this.selectedStocks.map(stock =>
                        this.inventoryService.deleteStock(stock.id)
                    );

                    // Using forkJoin (requires import from 'rxjs') to wait for all deletes
                    import('rxjs').then(({ forkJoin }) => {
                        forkJoin(deleteRequests).subscribe({
                            next: () => {
                                this.messageService.add({
                                    severity: 'success',
                                    summary: 'Successful',
                                    detail: 'Stock Records Deleted',
                                    life: 3000
                                });
                                this.loadStocks(); // Refresh the table
                                this.selectedStocks = null; // Clear selection
                            },
                            error: (err) => {
                                this.messageService.add({
                                    severity: 'error',
                                    summary: 'Error',
                                    detail: 'Failed to delete some records',
                                    life: 3000
                                });
                            }
                        });
                    });
                }
            }
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    hideDialog() {
        this.stockDialog = false;
    }
}
