import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimelineModule } from 'primeng/timeline';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TrackingDetail } from '../../../shared/interfaces/shipping';
import { Master } from '../../../shared/services/master';
import { Auth } from '../../../shared/services/auth';


@Component({
  selector: 'app-tracking',
  standalone: true,
imports: [CommonModule, FormsModule, TimelineModule, InputTextModule, ButtonModule],
  template: `

  <div class="card" *ngIf="isAuthenticated()">
      <div class="font-semibold text-xl mb-4">Order/Shipment Tracking</div>
      <p>Enter a tracking number to view the progress of your order.</p>
      <div class="max-w-5xl mx-auto p-4 space-y-6 font-sans transition-colors duration-300">

      <div class="bg-white dark:bg-slate-900 p-2 md:p-3 rounded-2xl border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row gap-2 items-center transition-all duration-300">

      <div class="group flex-1 w-full relative">


        <input
          type="text"
          pInputText
          [(ngModel)]="searchNumber"
          placeholder="Enter Shipment Number (e.g. 34473660196)"
          class="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border-transparent dark:border-transparent focus:border-red-600 dark:focus:border-red-500 focus:bg-white dark:focus:bg-slate-800 rounded-xl transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-slate-500"
          (keyup.enter)="onSearch()" />

        <div class="absolute inset-0 border border-gray-200 dark:border-slate-700 pointer-events-none rounded-xl group-hover:border-gray-300 dark:group-hover:border-slate-600 transition-colors"></div>
      </div>

      <button
        pButton
        [loading]="loading()"
        (click)="onSearch()"
        class="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold border-none rounded-xl shadow-lg shadow-red-600/20 active:scale-95 transition-all duration-200">

        <div class="flex items-center justify-center gap-2">
           <span *ngIf="!loading()">Track Now</span>
           <i *ngIf="!loading()" class="pi pi-arrow-right text-sm"></i>
        </div>
      </button>
    </div>

    <div *ngIf="error()"
         class="flex items-center gap-3 p-4 text-sm transition-colors duration-300 border rounded-xl
                bg-red-50 text-red-600 border-red-100
                dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50">

        <i class="pi pi-exclamation-circle text-lg"></i>
        <div class="font-medium">
            {{ error() }}
        </div>
    </div>

      <div *ngIf="trackingData() as data" class="space-y-6 animate-fade-in">

      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border-t-4 border-dark-600 p-6 md:p-8 border border-gray-100 dark:border-slate-800 transition-all duration-300">

    <div class="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
      <div class="space-y-2">
        <span class="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-widest">
          Daz Electronics Shipment
        </span>
        <div class="flex items-center gap-3">
          <h1 class="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
            {{ data.tracking_number }}
          </h1>
          <i class="pi pi-send text-slate-300 dark:text-slate-600 text-xl rotate-45"></i>
        </div>
      </div>

      <div class="md:text-right max-w-xs">
        <p class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Latest Update</p>
        <p class="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed italic">
          "{{ data.latest_update }}"
        </p>
      </div>
    </div>

    <div class="relative w-full">

      <div class="hidden md:flex relative items-center w-full min-h-[60px]">
        <div class="absolute inset-x-0 top-[10px] border-t-2 border-dashed border-gray-100 dark:border-slate-800 z-0"></div>

        <div class="relative z-10 flex justify-between w-full">
          <div class="bg-white dark:bg-slate-900 pr-8">
            <p class="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase">Origin</p>
            <p class="text-slate-900 dark:text-slate-100 font-black text-xl leading-none mt-1">Tanzania</p>
            <p class="text-red-600 dark:text-red-500 text-sm font-medium mt-1">{{ data.origin_city }}</p>
          </div>

          <div class="bg-white dark:bg-slate-900 pl-8 text-right">
            <p class="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase">Destination</p>
            <p class="text-slate-900 dark:text-slate-100 font-black text-xl leading-none mt-1">Tanzania</p>
            <p class="text-red-600 dark:text-red-500 text-sm font-medium mt-1">{{ data.destination_city }}</p>
          </div>
        </div>
      </div>

      <div class="md:hidden flex flex-col gap-6 border-l-2 border-red-600 pl-5 py-1">
        <div class="relative">
          <div class="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-red-600 ring-4 ring-white dark:ring-slate-900"></div>
          <p class="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase">Origin</p>
          <p class="text-slate-900 dark:text-slate-100 font-bold">Tanzania, <span class="text-red-600 dark:text-red-500 font-medium">{{ data.origin_city }}</span></p>
        </div>

        <div class="relative">
          <div class="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-red-600 ring-4 ring-white dark:ring-slate-900"></div>
          <p class="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase">Destination</p>
          <p class="text-slate-900 dark:text-slate-100 font-bold">United States, <span class="text-red-600 dark:text-red-500 font-medium">{{ data.destination_city }}</span></p>
        </div>
      </div>

    </div>


          <div class="flex flex-col md:flex-row justify-between relative mt-16 px-4">
            <div class="hidden md:block absolute top-4 left-0 w-full h-[3px] bg-gray-100 dark:bg-slate-800 z-0"></div>

            @for (step of statusSteps; track step.status) {
              <div class="flex md:flex-col items-center z-10 mb-8 md:mb-0 group flex-1">
                <div [ngClass]="{
                  'bg-green-500 border-green-500 ring-4 ring-green-100 dark:ring-green-900/30': isCompleted(step.status),
                  'bg-red-600 border-red-600 animate-pulse ring-4 ring-red-100 dark:ring-red-900/30': isCurrent(step.status),
                  'bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700': !isCompleted(step.status) && !isCurrent(step.status)
                }" class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-white transition-all duration-500">
                    <i *ngIf="isCompleted(step.status)" class="pi pi-check text-[10px] font-bold"></i>
                    <div *ngIf="isCurrent(step.status)" class="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p class="ml-4 md:ml-0 md:mt-4 text-[10px] font-black titlecase text-center max-w-[80px]"
                   [ngClass]="isCompleted(step.status) || isCurrent(step.status) ? 'text-slate-800 dark:text-slate-200' : 'text-gray-300 dark:text-slate-600'">
                  {{ step.label }}
                </p>
              </div>
            }
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white dark:bg-slate-900 p-5 rounded-lg shadow-sm flex items-center gap-4 border-l-4 border-red-600 dark:border-slate-800">
                <i class="pi pi-box text-3xl text-gray-200 dark:text-slate-700"></i>
                <div><p class="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold">Type</p><p class="font-bold text-red-600">Parcel Express</p></div>
            </div>
            <div class="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm flex items-center gap-4 border border-gray-100 dark:border-slate-800 transition-colors duration-300">
        <div class="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
            <i class="pi pi-list text-2xl text-gray-400 dark:text-slate-500 transition-colors"></i>
        </div>
        <div>
            <p class="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold tracking-tight">Items</p>
            <p class="font-bold text-slate-800 dark:text-slate-100">{{ data.number_of_items }} Units</p>
        </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm flex items-center gap-4 border border-gray-100 dark:border-slate-800 transition-colors duration-300">
            <div class="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                <i class="pi pi-info-circle text-2xl text-gray-400 dark:text-slate-500 transition-colors"></i>
            </div>
            <div>
                <p class="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold tracking-tight">Total Weight</p>
                <p class="font-bold text-slate-800 dark:text-slate-100">{{ data.total_weight_kg }} KG</p>
            </div>
        </div>
            </div>

        <div class="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-8 border dark:border-slate-800">
            <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 mb-8 border-b dark:border-slate-800 pb-4">Shipment History</h3>
            <p-timeline [value]="data.tracking_history" class="w-full">
                <ng-template pTemplate="content" let-event>
                    <div class="mb-10 pl-4">
                        <p class="font-bold text-slate-800 dark:text-slate-200 leading-none">{{ event.status_display }}</p>
                        <p class="text-xs text-gray-500 dark:text-slate-400 mt-2">{{ event.description }}</p>
                        <p class="text-[10px] font-bold text-red-600 dark:text-red-500 mt-1 uppercase tracking-widest">{{ event.location }}</p>
                    </div>
                </ng-template>
                <ng-template pTemplate="opposite" let-event>
                    <span class="text-xs font-mono text-gray-400 dark:text-slate-500">{{ event.timestamp }}</span>
                </ng-template>
            </p-timeline>
        </div>
      </div>
    </div>
  </div>

  <div *ngIf="!isAuthenticated()" class="max-w-5xl mx-auto p-4 space-y-6 font-sans transition-colors duration-300 mt-4">

  <div class="bg-white dark:bg-slate-900 p-2 md:p-3 rounded-2xl border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row gap-2 items-center transition-all duration-300">

  <div class="group flex-1 w-full relative">


    <input
      type="text"
      pInputText
      [(ngModel)]="searchNumber"
      placeholder="Enter Shipment Number (e.g. 34473660196)"
      class="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border-transparent dark:border-transparent focus:border-red-600 dark:focus:border-red-500 focus:bg-white dark:focus:bg-slate-800 rounded-xl transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-slate-500"
      (keyup.enter)="onSearch()" />

    <div class="absolute inset-0 border border-gray-200 dark:border-slate-700 pointer-events-none rounded-xl group-hover:border-gray-300 dark:group-hover:border-slate-600 transition-colors"></div>
  </div>

  <button
    pButton
    [loading]="loading()"
    (click)="onSearch()"
    class="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold border-none rounded-xl shadow-lg shadow-red-600/20 active:scale-95 transition-all duration-200">

    <div class="flex items-center justify-center gap-2">
       <span *ngIf="!loading()">Track Now</span>
       <i *ngIf="!loading()" class="pi pi-arrow-right text-sm"></i>
    </div>
  </button>
</div>

<div *ngIf="error()"
     class="flex items-center gap-3 p-4 text-sm transition-colors duration-300 border rounded-xl
            bg-red-50 text-red-600 border-red-100
            dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50">

    <i class="pi pi-exclamation-circle text-lg"></i>
    <div class="font-medium">
        {{ error() }}
    </div>
</div>

  <div *ngIf="trackingData() as data" class="space-y-6 animate-fade-in">

  <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border-t-4 border-dark-600 p-6 md:p-8 border border-gray-100 dark:border-slate-800 transition-all duration-300">

<div class="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
  <div class="space-y-2">
    <span class="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-widest">
      Daz Electronics Shipment
    </span>
    <div class="flex items-center gap-3">
      <h1 class="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
        {{ data.tracking_number }}
      </h1>
      <i class="pi pi-send text-slate-300 dark:text-slate-600 text-xl rotate-45"></i>
    </div>
  </div>

  <div class="md:text-right max-w-xs">
    <p class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Latest Update</p>
    <p class="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed italic">
      "{{ data.latest_update }}"
    </p>
  </div>
</div>

<div class="relative w-full">

  <div class="hidden md:flex relative items-center w-full min-h-[60px]">
    <div class="absolute inset-x-0 top-[10px] border-t-2 border-dashed border-gray-100 dark:border-slate-800 z-0"></div>

    <div class="relative z-10 flex justify-between w-full">
      <div class="bg-white dark:bg-slate-900 pr-8">
        <p class="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase">Origin</p>
        <p class="text-slate-900 dark:text-slate-100 font-black text-xl leading-none mt-1">Tanzania</p>
        <p class="text-red-600 dark:text-red-500 text-sm font-medium mt-1">{{ data.origin_city }}</p>
      </div>

      <div class="bg-white dark:bg-slate-900 pl-8 text-right">
        <p class="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase">Destination</p>
        <p class="text-slate-900 dark:text-slate-100 font-black text-xl leading-none mt-1">Tanzania</p>
        <p class="text-red-600 dark:text-red-500 text-sm font-medium mt-1">{{ data.destination_city }}</p>
      </div>
    </div>
  </div>

  <div class="md:hidden flex flex-col gap-6 border-l-2 border-red-600 pl-5 py-1">
    <div class="relative">
      <div class="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-red-600 ring-4 ring-white dark:ring-slate-900"></div>
      <p class="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase">Origin</p>
      <p class="text-slate-900 dark:text-slate-100 font-bold">Tanzania, <span class="text-red-600 dark:text-red-500 font-medium">{{ data.origin_city }}</span></p>
    </div>

    <div class="relative">
      <div class="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-red-600 ring-4 ring-white dark:ring-slate-900"></div>
      <p class="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase">Destination</p>
      <p class="text-slate-900 dark:text-slate-100 font-bold">United States, <span class="text-red-600 dark:text-red-500 font-medium">{{ data.destination_city }}</span></p>
    </div>
  </div>

</div>


      <div class="flex flex-col md:flex-row justify-between relative mt-16 px-4">
        <div class="hidden md:block absolute top-4 left-0 w-full h-[3px] bg-gray-100 dark:bg-slate-800 z-0"></div>

        @for (step of statusSteps; track step.status) {
          <div class="flex md:flex-col items-center z-10 mb-8 md:mb-0 group flex-1">
            <div [ngClass]="{
              'bg-green-500 border-green-500 ring-4 ring-green-100 dark:ring-green-900/30': isCompleted(step.status),
              'bg-red-600 border-red-600 animate-pulse ring-4 ring-red-100 dark:ring-red-900/30': isCurrent(step.status),
              'bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700': !isCompleted(step.status) && !isCurrent(step.status)
            }" class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-white transition-all duration-500">
                <i *ngIf="isCompleted(step.status)" class="pi pi-check text-[10px] font-bold"></i>
                <div *ngIf="isCurrent(step.status)" class="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <p class="ml-4 md:ml-0 md:mt-4 text-[10px] font-black titlecase text-center max-w-[80px]"
               [ngClass]="isCompleted(step.status) || isCurrent(step.status) ? 'text-slate-800 dark:text-slate-200' : 'text-gray-300 dark:text-slate-600'">
              {{ step.label }}
            </p>
          </div>
        }
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white dark:bg-slate-900 p-5 rounded-lg shadow-sm flex items-center gap-4 border-l-4 border-red-600 dark:border-slate-800">
            <i class="pi pi-box text-3xl text-gray-200 dark:text-slate-700"></i>
            <div><p class="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold">Type</p><p class="font-bold text-red-600">Parcel Express</p></div>
        </div>
        <div class="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm flex items-center gap-4 border border-gray-100 dark:border-slate-800 transition-colors duration-300">
    <div class="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
        <i class="pi pi-list text-2xl text-gray-400 dark:text-slate-500 transition-colors"></i>
    </div>
    <div>
        <p class="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold tracking-tight">Items</p>
        <p class="font-bold text-slate-800 dark:text-slate-100">{{ data.number_of_items }} Units</p>
    </div>
    </div>

    <div class="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm flex items-center gap-4 border border-gray-100 dark:border-slate-800 transition-colors duration-300">
        <div class="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
            <i class="pi pi-info-circle text-2xl text-gray-400 dark:text-slate-500 transition-colors"></i>
        </div>
        <div>
            <p class="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold tracking-tight">Total Weight</p>
            <p class="font-bold text-slate-800 dark:text-slate-100">{{ data.total_weight_kg }} KG</p>
        </div>
    </div>
        </div>

    <div class="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-8 border dark:border-slate-800">
        <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 mb-8 border-b dark:border-slate-800 pb-4">Shipment History</h3>
        <p-timeline [value]="data.tracking_history" class="w-full">
            <ng-template pTemplate="content" let-event>
                <div class="mb-10 pl-4">
                    <p class="font-bold text-slate-800 dark:text-slate-200 leading-none">{{ event.status_display }}</p>
                    <p class="text-xs text-gray-500 dark:text-slate-400 mt-2">{{ event.description }}</p>
                    <p class="text-[10px] font-bold text-red-600 dark:text-red-500 mt-1 uppercase tracking-widest">{{ event.location }}</p>
                </div>
            </ng-template>
            <ng-template pTemplate="opposite" let-event>
                <span class="text-xs font-mono text-gray-400 dark:text-slate-500">{{ event.timestamp }}</span>
            </ng-template>
        </p-timeline>
    </div>
  </div>
</div>

  `,
  styles: `

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
    animation: fadeIn 0.4s ease-out forwards;
}

@keyframes custom-pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
}

.animate-pulse {
  animation: custom-pulse 2s infinite;
}

/* PrimeNG Overrides */
:host ::ng-deep .p-timeline-event-opposite {
    text-align: right !important;
    padding-right: 2rem !important;
    min-width: 150px;
}

:host ::ng-deep .p-timeline-event-connector {
    background-color: #fee2e2 !important; /* light red */
    width: 2px !important;
}

  `
})
export class Tracking implements OnInit {

  private trackingService = inject(Master);
  private authService = inject(Auth);

  isAuthenticated = signal<boolean>(false);
  trackingData = signal<TrackingDetail | null>(null);
  loading = signal<boolean>(false);
  searchNumber = signal<string>('');
  error = signal<string | null>(null);

  readonly statusSteps = [
    { status: 'REQUESTED', label: 'Created' },
    { status: 'COLLECTED', label: 'Collected' },
    { status: 'DEPARTED', label: 'Departed' },
    { status: 'IN_TRANSIT', label: 'In Transit' },
    { status: 'ARRIVED_DEST', label: 'Arrived at destination' },
    { status: 'OUT_FOR_DELIVERY', label: 'Out for delivery' },
    { status: 'DELIVERED', label: 'Delivered' }
  ];

  ngOnInit() {
    this.checkUserAuthStatus()
  }

  checkUserAuthStatus(){

    if(this.authService.getAuthenticatedUser()){
      return this.isAuthenticated.set(true);
    }

    return this.isAuthenticated.set(false);

  }

  onSearch() {
    const num = this.searchNumber().trim();
    if (!num) return;
    this.loadTrackingDetails(num);
  }

  loadTrackingDetails(num: string) {
    this.loading.set(true);
    this.error.set(null);

    this.trackingService.trackOrder(num).subscribe({
      next: (data) => {
        this.trackingData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        const apiErrorMessage = err.error?.detail || "An unexpected error occurred. Please try again later.";

        this.error.set(apiErrorMessage);
        this.trackingData.set(null);
        this.loading.set(false);
      }
    });
  }

  isCompleted(stepStatus: string): boolean {
    const data = this.trackingData();
    if (!data) return false;
    if (data.status === 'DELIVERED') return true;

    const stepIndex = this.statusSteps.findIndex(s => s.status === stepStatus);
    return stepIndex < data.current_stage;
  }

  isCurrent(stepStatus: string): boolean {
    return this.trackingData()?.status === stepStatus;
  }
}
