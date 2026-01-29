import { Component, OnInit, signal, ViewChild, inject } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { User, UserDataPayload, ApiResponse, NextOfKin, UserAddress } from '../../../shared/interfaces/user';
import { Auth } from '../../../shared/services/auth';



@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
      CommonModule
    ],
    template: `

    <div class="animate-fadein space-y-8" *ngIf="userProfile">
    <div class="grid grid-cols-1 gap-6">
      <div class="relative flex flex-col items-center bg-surface-50 dark:bg-surface-800/50 p-6 rounded-xl border border-surface-200 dark:border-surface-700">

        <div class="relative inline-block">
          <div class="min-h-[110px]">
            <img *ngIf="userProfile.profile_picture?.image" [src]="userProfile.profile_picture.image"
              class="w-32 h-32 rounded-full border-4 border-white dark:border-surface-700 shadow-md object-cover mb-4" />

            <div *ngIf="!userProfile.profile_picture?.image"
              class="w-32 h-32 rounded-full border-4 border-white dark:border-surface-700 shadow-md mb-4 flex items-center justify-center bg-primary-500 text-white text-4xl font-bold tracking-tighter">
              {{ userInitials }}
            </div>
          </div>

          <button (click)="editSection('photo')" class="absolute bottom-1 right-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
            <i class="pi pi-camera text-slate-600 dark:text-slate-300 text-xs group-hover:text-blue-600"></i>
          </button>
        </div>

        <div class="text-center">
          <p class="font-bold text-lg text-surface-900 dark:text-white">
            {{userProfile.title}}. {{ userProfile.first_name | titlecase }} {{ userProfile.last_name | titlecase}}
          </p>
          <p class="text-sm text-surface-500 mt-1">
            {{(userProfile.nationality | titlecase ) || 'Not Specified'}}
          </p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="relative bg-surface-50 dark:bg-surface-800/50 p-5 rounded-2xl border border-surface-100 dark:border-surface-700">
        <button (click)="editSection('personal')" class="absolute top-4 right-4 p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full">
          <i class="pi pi-pencil"></i>
        </button>
        <div class="flex items-center gap-2 mb-4 text-primary-600 dark:text-primary-400 font-bold">
          <i class="pi pi-user"></i> <span>Personal Details</span>
        </div>
        <div class="space-y-3">
          <p class="flex justify-between"><span class="text-surface-500">Email:</span> <span class="font-medium">{{userProfile.email}}</span></p>
          <p class="flex justify-between"><span class="text-surface-500">Phone:</span> <span class="font-medium">{{userProfile.phone_number}}</span></p>
          <p class="flex justify-between"><span class="text-surface-500">Birth Date:</span> <span class="font-medium">{{userProfile.birth_date | date}}</span></p>
          <p class="flex justify-between"><span class="text-surface-500">Status:</span>
              <span class="px-2 py-0.5 rounded text-xs" [ngClass]="userProfile.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                  {{userProfile.is_active ? 'Active' : 'Inactive'}}
              </span>
          </p>
        </div>
      </div>

      <div class="relative bg-surface-50 dark:bg-surface-800/50 p-5 rounded-2xl border border-surface-100 dark:border-surface-700">
        <div class="flex items-center gap-2 mb-4 text-primary-600 dark:text-primary-400 font-bold">
          <i class="pi pi-building"></i> <span>Work Assignment</span>
        </div>
        <div class="space-y-3" *ngIf="userProfile.work_location; else noLocation">
          <p class="flex justify-between"><span class="text-surface-500">Outlet:</span> <span class="font-medium">{{userProfile.work_location.location_name}}</span></p>
          <p class="flex justify-between"><span class="text-surface-500">Code:</span> <span class="font-mono font-medium">{{userProfile.work_location.location_code}}</span></p>
          <p class="flex justify-between"><span class="text-surface-500">Region:</span> <span class="font-medium">{{userProfile.work_location.region_name}}</span></p>
          <p class="text-xs text-surface-400 mt-2 italic">{{userProfile.work_location.location_address}}</p>
        </div>
        <ng-template #noLocation><p class="text-surface-400 italic">No location assigned.</p></ng-template>
      </div>

      <div class="relative md:col-span-1 bg-surface-50 dark:bg-surface-800/50 p-5 rounded-2xl border border-surface-100 dark:border-surface-700">
        <button (click)="editSection('address')" class="absolute top-4 right-4 p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full">
          <i class="pi pi-pencil"></i>
        </button>
        <div class="flex items-center gap-2 mb-4 text-primary-600 dark:text-primary-400 font-bold">
          <i class="pi pi-map-marker"></i> <span>Residential Address</span>
        </div>
        <div class="space-y-3" *ngFor="let addr of userProfile.addresses">
          <div *ngIf="addr.is_default">
              <p class="flex justify-between"><span class="text-surface-500">Location:</span> <span class="font-medium">{{addr.address.ward}}, {{addr.address.district}}</span></p>
              <p class="flex justify-between"><span class="text-surface-500">Street:</span> <span class="font-medium">{{addr.address.street}}</span></p>
              <p class="flex justify-between"><span class="text-surface-500">House No:</span> <span class="font-medium">{{addr.address.house_number}}</span></p>
          </div>
        </div>
      </div>

      <div class="relative md:col-span-2 bg-surface-50 dark:bg-surface-800/50 p-5 rounded-2xl border border-surface-100 dark:border-surface-700">
        <button (click)="editSection('kin')" class="absolute top-4 right-4 p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full">
          <i class="pi pi-pencil"></i>
        </button>
        <div class="flex items-center gap-2 mb-4 text-primary-600 dark:text-primary-400 font-bold">
          <i class="pi pi-users"></i> <span>Next of Kin ({{userProfile.next_of_kin.length}})</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div *ngFor="let kin of userProfile.next_of_kin" class="p-3 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
            <p class="font-bold text-sm text-surface-900 dark:text-white">{{kin.first_name | uppercase}} {{kin.last_name | uppercase }}</p>
            <p class="text-xs text-surface-500">{{kin.phone_number}}</p>
            <p class="text-xs text-surface-500">{{kin.physical_address}}</p>
          </div>
        </div>
      </div>
    </div>
    </div>

    `,
    // providers: [MessageService, ConfirmationService]
})
export class Profile implements OnInit {

  userProfile!: User;
  userInitials: string = '';
  termsAccepted: boolean = false;
  loading: boolean = false;

  constructor(private profileService: Auth, private router: Router) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.profileService.getUserProfile().subscribe({
      next: (data) => {
        this.userProfile = data;
        this.userInitials = `${data.first_name[0]}${data.last_name[0]}`;
      },
      error: (err) => console.error('Failed to load profile', err)
    });
  }

  editSection(section: string) {
    // Navigate back to the specific step in your stepper/form
    console.log(`Navigating to edit ${section}`);
    // Example: this.router.navigate(['/register'], { queryParams: { step: section } });
  }

  onSubmit() {
    this.loading = true;
    // Logic for completion...
  }

}
