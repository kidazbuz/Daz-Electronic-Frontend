import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { forkJoin } from 'rxjs';

// PrimeNG
import { Table, TableModule } from 'primeng/table';
import { FileUploadModule, FileUpload } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { KnobModule } from 'primeng/knob';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProductManager } from '../../../shared/services/product-manager';

@Component({
    selector: 'app-software',
    standalone: true,
    imports: [
        CommonModule, TableModule, FileUploadModule, FormsModule, ButtonModule,
        ToastModule, ToolbarModule, DialogModule, InputTextModule, KnobModule,
        ToggleButtonModule, TagModule, ConfirmDialogModule, IconFieldModule,
        InputIconModule, SelectModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
    <p-toast />
      <p-confirmdialog />

      <p-dialog [(visible)]="showProgress" [modal]="true" [closable]="false" header="Uploading..." [style]="{width: '250px'}">
        <div class="flex flex-col items-center justify-center p-4">
            <p-knob [(ngModel)]="uploadProgress" [readonly]="true" valueTemplate="{value}%" [size]="150" />
        </div>
      </p-dialog>

      <div class="card border-none bg-transparent">
        <p-toolbar styleClass="mb-6 shadow-sm border-round-xl">
            <ng-template #start>
                <p-button label="Upload New" icon="pi pi-plus" class="mr-2" (onClick)="openNew()" />
                <p-button label="Delete" icon="pi pi-trash" severity="danger" outlined (onClick)="deleteSelectedSoftwares()" [disabled]="!selectedItems?.length" />
            </ng-template>
        </p-toolbar>

        <p-table
              #dt
              [value]="softwares()"
              [rows]="10"
              [paginator]="true"
              [globalFilterFields]="['name', 'description']"
              [tableStyle]="{ 'min-width': '75rem' }"
              [(selection)]="selectedItems"
              [rowHover]="true"
              dataKey="id"
              styleClass="p-datatable-sm shadow-1 border-round-xl overflow-hidden"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} softwares"
              [showCurrentPageReport]="true"

          >

              <ng-template #caption>
                  <div class="flex items-center justify-between">
                      <h5 class="m-0">Software Repository</h5>
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
                      <th>Category</th>
                      <th>Size</th>
                      <th>For Sale</th>
                      <th style="width: 10rem"></th>
                  </tr>
              </ng-template>
              <ng-template #body let-item>
                  <tr>
                      <td><p-tableCheckbox [value]="item" /></td>
                      <td><span class="font-bold">{{ item.name }}</span></td>
                      <td><p-tag [value]="item.category" severity="secondary" /></td>
                      <td>{{ item.size_mb }} MB</td>
                      <td>
                          <p-togglebutton [(ngModel)]="item.is_for_sale" onLabel="Sale" offLabel="Private"
                              onIcon="pi pi-check" offIcon="pi pi-lock" (onChange)="toggleSaleStatus(item)" />
                      </td>
                      <td>
                          <div class="flex gap-2">
                              <p-button icon="pi pi-download" [rounded]="true" severity="info" (onClick)="download(item)" />
                              <p-button icon="pi pi-pencil" [rounded]="true" outlined (onClick)="edit(item)" />
                              <p-button icon="pi pi-trash" [rounded]="true" severity="danger" (onClick)="delete(item)" />
                          </div>
                      </td>
                  </tr>
              </ng-template>
          </p-table>
        </div>

        <p-dialog [(visible)]="displayDialog" [style]="{ width: '650px' }" [header]="editMode ? 'Edit Details' : 'New Software'" [modal]="true">
      <div class="flex flex-col gap-4 mt-2">

          <div>
              <label class="block font-bold mb-2">Category</label>
              <p-select [options]="categories" [(ngModel)]="tempItem.category" placeholder="Select Category" class="w-full" fluid />
          </div>

          <div *ngIf="!editMode">
              <label class="block font-bold mb-2">Software Files</label>
              <p-fileupload #fileUploader name="file" [multiple]="true" [accept]="acceptTypes" [customUpload]="true" (uploadHandler)="onUpload($event)">

                  <ng-template #header let-files let-chooseCallback="chooseCallback" let-clearCallback="clearCallback" let-uploadCallback="uploadCallback">
                      <div class="hidden"></div>
                  </ng-template>

                  <ng-template #content let-files let-removeFileCallback="removeFileCallback" let-chooseCallback="chooseCallback" let-uploadCallback="uploadCallback" let-clearCallback="clearCallback">

                      <div *ngIf="files.length === 0" (click)="chooseCallback()"
                           class="flex flex-col items-center justify-center p-8 border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-xl cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-900 transition-colors">
                          <i class="pi pi-cloud-upload text-6xl text-primary mb-4"></i>
                          <p class="text-xl font-semibold">Drag and Drop or Click to Select</p>
                      </div>

                      <div *ngIf="files.length > 0" class="flex flex-col gap-2 mb-4">
                          <div *ngFor="let file of files; let i = index"
                               class="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-700">
                              <div class="flex items-center gap-3 flex-grow">
                                  <i class="pi pi-file text-2xl text-primary"></i>
                                  <input pInputText [(ngModel)]="file.customName" [placeholder]="file.name" class="p-inputtext-sm w-full" />
                              </div>
                              <div class="flex items-center gap-2 ml-4">
                                  <small class="whitespace-nowrap">{{(file.size/1024/1024).toFixed(2)}} MB</small>
                                  <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [text]="true" (onClick)="removeFileCallback(i)" />
                              </div>
                          </div>
                      </div>

                      <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
                        <p-button
                            label="Add More"
                            icon="pi pi-plus"
                            [text]="true"
                            (onClick)="chooseCallback()" />

                        <p-button
                            label="Cancel"
                            icon="pi pi-times"
                            severity="secondary"
                            [text]="true"
                            (onClick)="displayDialog = false; clearCallback()" />

                        <p-button
                            label="Upload"
                            icon="pi pi-upload"
                            severity="success"
                            (onClick)="fileUploader.upload()"
                            [disabled]="!files.length" />
                    </div>
                  </ng-template>
              </p-fileupload>
          </div>

          <div *ngIf="editMode" class="flex flex-col gap-3">
              <label class="font-bold">Software Name</label>
              <input pInputText [(ngModel)]="tempItem.name" class="w-full" />

              <p-togglebutton [(ngModel)]="tempItem.is_for_sale" onLabel="Public for Sale" offLabel="Internal Only" class="w-full" />

              <div class="flex justify-end gap-2 mt-4">
                  <p-button label="Cancel" [text]="true" (onClick)="displayDialog = false" />
                  <p-button label="Save Changes" icon="pi pi-check" (onClick)="saveEdit()" />
              </div>
          </div>
      </div>
  </p-dialog>
    `
})
export class Software implements OnInit {
    softwares = signal<any[]>([]);
    selectedItems: any[] | null = null;
    displayDialog = false;
    editMode = false;
    tempItem: any = { category: 'Uncategorized', is_for_sale: false };

    // Progress state
    showProgress = false;
    uploadProgress = 0;

    categories = [
        { label: 'Uncategorized', value: 'Uncategorized' },
        { label: 'Firmware', value: 'Firmware' },
        { label: 'Utility', value: 'Utility' },
        { label: 'Operating System', value: 'Operating System' },
        { label: 'Multimedia', value: 'Multimedia' }
    ];

    // Backend compatible types
    acceptTypes = '.exe,.msi,.zip,.tar,.gz,.bin';

    @ViewChild('dt') dt!: Table;
    @ViewChild('fileUploader') fileUploader!: FileUpload;

    constructor(
        private softwareService: ProductManager,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() { this.loadData(); }

    loadData() {
        this.softwareService.getSoftwares().subscribe(data => this.softwares.set(data));
    }

    openNew() {
        this.tempItem = { category: 'Uncategorized', is_for_sale: false };
        this.editMode = false;
        this.displayDialog = true;
    }

    edit(item: any) {
        this.tempItem = { ...item };
        this.editMode = true;
        this.displayDialog = true;
    }

    // Toggle Sale status with Toast
    toggleSaleStatus(item: any) {
        // Create a partial payload to avoid sending the 'file' URL string
        const partialUpdate = {
            name: item.name,
            category: item.category,
            is_for_sale: item.is_for_sale
        };

        this.softwareService.updateSoftware(item.id, partialUpdate).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Status Updated',
                    detail: `${item.name} is now ${item.is_for_sale ? 'For Sale' : 'Private'}`
                });
            },
            error: (err) => {
                // Revert the toggle in the UI if the API call fails
                item.is_for_sale = !item.is_for_sale;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Update Failed',
                    detail: 'Could not update sale status.'
                });
            }
        });
    }

    onUpload(event: any) {
        const files: any[] = event.files;
        this.showProgress = true;
        this.uploadProgress = 0;

        const uploads = files.map(file => {
            const formData = new FormData();
            const finalName = file.customName || file.name;

            formData.append('file', file);
            formData.append('name', finalName);
            formData.append('category', this.tempItem.category || 'Uncategorized');
            formData.append('is_for_sale', String(this.tempItem.is_for_sale));
            formData.append('size_mb', (file.size / (1024 * 1024)).toFixed(2));

            return this.softwareService.uploadSoftware(formData);
        });

        uploads.forEach(u => {
            u.subscribe({
                next: (res: any) => {
                    if (res.type === HttpEventType.UploadProgress) {
                        this.uploadProgress = Math.round((100 * res.loaded) / res.total);
                    }
                },
                error: () => {
                    this.showProgress = false;
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Upload failed' });
                },
                complete: () => {
                    // 1. Hide the progress knob
                    this.showProgress = false;

                    // 2. Clear the PrimeNG FileUpload internal state (Removes files from UI)
                    if (this.fileUploader) {
                        this.fileUploader.clear();
                    }

                    // 3. Reset the category/sale defaults for the next upload
                    this.tempItem = { category: 'Uncategorized', is_for_sale: false };

                    // 4. Close the dialog and refresh table
                    this.displayDialog = false;
                    this.loadData();

                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Files uploaded and cleared' });
                }
            });
        });
    }

    saveEdit() {
        // this.submitted = true;

        // Construct payload without the file field for editing metadata
        const payload = {
            name: this.tempItem.name,
            category: this.tempItem.category,
            is_for_sale: this.tempItem.is_for_sale
        };

        if (this.tempItem.id) {
            this.softwareService.updateSoftware(this.tempItem.id, payload).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Updated',
                        detail: 'Software details updated successfully'
                    });
                    this.loadData();
                    this.displayDialog = false;
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update software details'
                    });
                }
            });
        }
    }

    delete(item: any) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${item.name}?`,
            accept: () => {
                this.softwareService.deleteSoftware(item.id).subscribe(() => {
                    this.loadData();
                    this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'File removed' });
                });
            }
        });
    }

    deleteSelectedSoftwares() {
        this.confirmationService.confirm({
            message: 'Delete selected items?',
            accept: () => {
                const requests = this.selectedItems!.map(i => this.softwareService.deleteSoftware(i.id));
                forkJoin(requests).subscribe(() => {
                    this.loadData();
                    this.selectedItems = null;
                    this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Bulk deletion complete' });
                });
            }
        });
    }

    download(item: any) {
        this.softwareService.downloadFile(item.id);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
