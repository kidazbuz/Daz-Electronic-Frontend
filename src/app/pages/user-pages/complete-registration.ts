import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors, ValidatorFn, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Master } from '../../shared/services/master';


export function ageValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const birthDate = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= minAge ? null : { underage: true };
  };
}


@Component({
    selector: 'app-complete-registration',
    imports: [DatePickerModule, ToastModule, CheckboxModule, InputTextModule, SelectModule, ButtonModule, ReactiveFormsModule, ReactiveFormsModule, FormsModule, CommonModule],
    standalone: true,
    template: `

        <p-toast></p-toast>

        <div *ngIf="!isSuccess">

        <div class="p-6">
        <div class="flex items-center justify-between max-w-2xl mx-auto">
          <div *ngFor="let step of [1,2,3,4,5]; let last = last" class="flex items-center" [class.flex-1]="!last">
            <div [class]="getStepClass(step)" class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300">
              <i [class]="step < activeStep ? 'pi pi-check' : ''"></i>
              <span *ngIf="step >= activeStep">{{step}}</span>
            </div>

            <div *ngIf="!last" class="flex-1 h-1 mx-2 md:mx-4 bg-surface-200 dark:bg-surface-700 min-w-[2rem]">
              <div class="h-full bg-primary-500 transition-all duration-500" [style.width]="activeStep > step ? '100%' : '0%'"></div>
            </div>
          </div>
        </div>
      </div>

        <form [formGroup]="registrationForm" (ngSubmit)="onSubmit()" class="p-6 md:p-10">

          <div *ngIf="activeStep === 1" formGroupName="personalInfo" class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadein">
            <div class="font-semibold col-span-full text-2xl">Personal Information</div>

            <div class="flex flex-col gap-2"><label class="font-semibold">Title</label><p-select [options]="titles" formControlName="title" placeholder="Select Title" fluid></p-select></div>
            <div class="flex flex-col gap-2"><label class="font-semibold">First Name</label><input pInputText formControlName="first_name" /></div>
            <div class="flex flex-col gap-2"><label class="font-semibold">Middle Name</label><input pInputText formControlName="middle_name" /></div>
            <div class="flex flex-col gap-2"><label class="font-semibold">Last Name</label><input pInputText formControlName="last_name" /></div>
            <div class="flex flex-col gap-2">
              <label class="font-semibold">Birth Date</label>
              <p-datepicker formControlName="birth_date" [showIcon]="true" [maxDate]="maxDate" fluid></p-datepicker>
              <small *ngIf="registrationForm.get('personalInfo.birth_date')?.errors?.['underage']" class="text-red-500">
                  You must be at least 15 years old to register.
              </small>

            </div>
            <div class="flex flex-col gap-2"><label class="font-semibold">Phone number</label><input pInputText formControlName="phone_number" placeholder="+255..."  /></div>
            <div class="flex flex-col gap-2"><label class="font-semibold">Secondary Phone (Optional)</label><input pInputText formControlName="second_phone_number" placeholder="+255..." /></div>
            <div class="flex flex-col gap-2"><label class="font-semibold">Nationality (Optional)</label><input pInputText formControlName="nationality" placeholder="e.g. Tanzanian" /></div>
          </div>

          <div *ngIf="activeStep === 2" formGroupName="address" class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadein">
            <div class="font-semibold col-span-full text-2xl">Residential Address</div>

            <div class="flex flex-col gap-2">
              <label class="font-semibold">Region</label>
              <p-select [options]="regions" (onChange)="onRegionChange($event)" optionLabel="name" optionValue="name" formControlName="region_id" placeholder="Select Region" [filter]="true" fluid></p-select>
            </div>

            <div class="flex flex-col gap-2">
              <label class="font-semibold">District</label>
              <p-select [options]="districts" (onChange)="onDistrictChange($event)" optionLabel="name" optionValue="name" formControlName="district" placeholder="Select District" [filter]="true" fluid></p-select>
            </div>

            <div class="flex flex-col gap-2">
                <label for="ward" class="font-semibold">Ward</label>
                <p-select
                    id="ward"
                    [options]="wards"
                    formControlName="ward"
                    optionLabel="name"
                    optionValue="name"
                    (onChange)="onWardChange($event)"
                    placeholder="Select Ward"
                    [filter]="true"
                    fluid>
                </p-select>
            </div>

            <div class="flex flex-col gap-2">
              <div class="flex justify-between items-center">
                <label for="street" class="font-semibold">Street <span class="text-red-500">*</span></label>
                <span *ngIf="isManualStreet" class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Manual Entry</span>
              </div>

              <p-select
                *ngIf="!isManualStreet"
                id="street"
                [options]="streets"
                formControlName="street"
                optionLabel="name"
                optionValue="name"
                placeholder="Select Street"
                [filter]="true"
                fluid>
              </p-select>

              <div *ngIf="isManualStreet" class="flex flex-col gap-1 animate-fadein">
                <input
                  pInputText
                  id="street"
                  formControlName="street"
                  placeholder="Type Street Name manually..."
                  class="w-full" />
                <button
                  type="button"
                  *ngIf="streets.length > 0"
                  (click)="isManualStreet = false"
                  class="text-xs text-primary-500 text-left mt-1 hover:underline">
                  <i class="pi pi-refresh mr-1"></i> Try selection again
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label class="font-semibold text-surface-500">Post Code (Automatic)</label>
              <input
                  pInputText
                  formControlName="post_code"
                  class="bg-surface-100 dark:bg-surface-800 font-mono"
                  readonly />
            </div>

            <div class="flex flex-col gap-2 md:col-span-2">
              <label class="font-semibold">Street Prominent Name</label>
              <input pInputText formControlName="street_prominent_name" placeholder="Street Name" />
            </div>

            <div class="flex flex-col gap-2">
              <label class="font-semibold">House Number <span class="text-red-500">*</span></label>
              <input pInputText formControlName="house_number" placeholder="Enter House No." />
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-semibold">Plot Number (Optional)</label>
              <input pInputText formControlName="plot_number" placeholder="Enter Plot No." />
            </div>
          </div>

          <div *ngIf="activeStep === 3" class="animate-fadein space-y-6">
            <div class="border-b border-surface-200 dark:border-surface-700 pb-4">
              <div class="font-semibold col-span-full text-2xl mb-2">Next of Kin</div>
              <p class="text-sm text-surface-500">Add details for one or more emergency contacts.</p>
            </div>

            <div formArrayName="next_of_kin" class="space-y-6">
              <div *ngFor="let kin of nextOfKinGroups; let i = index" [formGroupName]="i"
                class="p-6 bg-surface-50/50 dark:bg-surface-800/30 border border-surface-200 dark:border-surface-700 rounded-2xl transition-all shadow-sm">

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold">First Name</label>
                    <input pInputText formControlName="first_name" fluid />
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold">Last Name</label>
                    <input pInputText formControlName="last_name" fluid />
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold">Phone Number</label>
                    <input pInputText formControlName="phone_number" placeholder="+255..." fluid />
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold">Email (Optional)</label>
                    <input pInputText formControlName="email" placeholder="example@mail.com" fluid />
                  </div>

                  <div class="flex flex-col gap-1 md:col-span-2">
                    <label class="text-sm font-semibold">Physical Address / Region <span class="text-red-500">*</span></label>
                    <p-select [options]="regions" formControlName="physical_address" optionLabel="name" optionValue="name"
                      placeholder="Select Kin's Region" [filter]="true" [showClear]="true" appendTo="body" fluid>
                      <ng-template pTemplate="item" let-region>
                        <div class="flex items-center gap-2">
                          <i class="pi pi-map-marker text-surface-400"></i>
                          <span>{{region.name}}</span>
                        </div>
                      </ng-template>
                    </p-select>
                  </div>
                </div>

                <div *ngIf="nextOfKinGroups.length > 1" class="mt-4 pt-4 border-t border-dashed border-surface-200 dark:border-surface-700 flex justify-end">
                  <p-button
                    label="Remove"
                    icon="pi pi-trash"
                    severity="danger"
                    [text]="true"
                    size="small"
                    (click)="removeNextOfKin(i)">
                  </p-button>
                </div>
              </div>
            </div>

            <div class="flex justify-center py-4">
              <p-button
                label="Add Another"
                icon="pi pi-plus-circle"
                [outlined]="true"
                severity="primary"
                (click)="addNextOfKin()"
                class="w-full md:w-auto">
              </p-button>
            </div>
          </div>

          <div *ngIf="activeStep === 4" class="animate-fadein flex flex-col items-center py-10">
            <div class="font-semibold col-span-full text-2xl mb-4">Profile Picture</div>
            <p class="text-surface-500 mb-8 text-center">Upload a professional photo or skip to use default avatar.</p>

            <div class="relative group">
              <div class="w-40 h-40 rounded-full border-4 border-surface-200 dark:border-surface-700 overflow-hidden bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                <img *ngIf="profilePreview" [src]="profilePreview" class="w-full h-full object-cover" />
                <i *ngIf="!profilePreview" class="pi pi-user text-6xl text-surface-300"></i>
              </div>
              <button type="button" (click)="fileInput.click()" class="absolute bottom-2 right-2 bg-primary-500 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform">
                <i class="pi pi-camera"></i>
              </button>
            </div>
            <input #fileInput type="file" (change)="onFileSelected($event)" accept="image/*" class="hidden" />

            <div class="mt-8 text-sm text-surface-400">Supported formats: JPG, PNG. Max 2MB.</div>
          </div>

          <div *ngIf="activeStep === 5" class="animate-fadein space-y-8">
              <div class="font-semibold col-span-full text-2xl mb-4">Review Your Information</div>
              <p class="text-surface-500">Please confirm all details are correct before finishing.</p>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2 flex flex-col items-center bg-surface-50 dark:bg-surface-800/50 p-6 rounded-xl border border-surface-200 dark:border-surface-700">

                    <img
                        *ngIf="profilePreview"
                        [src]="profilePreview"
                        class="w-32 h-32 rounded-full border-4 border-white dark:border-surface-700 shadow-md object-cover mb-4"
                    />

                    <div
                        *ngIf="!profilePreview"
                        class="w-32 h-32 rounded-full border-4 border-white dark:border-surface-700 shadow-md mb-4 flex items-center justify-center bg-primary-500 text-white text-4xl font-bold tracking-tighter">
                        {{ userInitials }}
                    </div>

                    <div class="text-center">
                        <p class="font-bold text-lg text-surface-900 dark:text-white">
                            {{previewData.personalInfo.title}}. {{ previewFullName }}
                        </p>
                        <p class="text-sm text-surface-500 mt-1" *ngIf="previewData.personalInfo.nationality">
                            <span class="font-semibold"></span> {{(previewData.personalInfo.nationality | titlecase ) || 'Not Specified'}}
                        </p>
                    </div>
                </div>
            </div>

            <div class="animate-fadein space-y-8">

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

                <div class="bg-surface-50 dark:bg-surface-800/50 p-5 rounded-2xl border border-surface-100 dark:border-surface-700">
                  <div class="flex items-center gap-2 mb-4 text-primary-600 dark:text-primary-400 font-bold">
                    <i class="pi pi-user"></i> <span>Personal Details</span>
                  </div>
                  <div class="space-y-3">
                    <p class="flex justify-between"><span class="text-surface-500">Title:</span> <span class="font-medium">{{previewData.personalInfo.title | titlecase}}</span></p>
                    <p class="flex justify-between"><span class="text-surface-500">First Name:</span> <span class="font-medium">{{previewData.personalInfo.first_name | titlecase }}</span></p>
                    <p class="flex justify-between"><span class="text-surface-500">Middle Name:</span> <span class="font-medium">{{previewData.personalInfo.middle_name | titlecase}}</span></p>
                    <p class="flex justify-between"><span class="text-surface-500">Last Name:</span> <span class="font-medium">{{previewData.personalInfo.last_name | titlecase }}</span></p>
                    <p class="flex justify-between"><span class="text-surface-500">Nationality:</span> <span class="font-medium">{{previewData.personalInfo.nationality | titlecase }}</span></p>
                    <p class="flex justify-between"><span class="text-surface-500">Phone Number:</span> <span class="font-medium">{{previewData.personalInfo.phone_number}}</span></p>
                    <p class="flex justify-between"><span class="text-surface-500">Second Mobile:</span> <span class="font-medium">{{previewData.personalInfo.second_phone_number || 'N/A'}}</span></p>
                    <p class="flex justify-between">
                    <span class="text-surface-500">Birth Date:</span>
                        <span class="font-medium">
                            {{previewData.personalInfo.birth_date | date}}
                            <span *ngIf="previewAge" class="text-surface-400 font-normal ml-1">
                                ({{ previewAge }} years old)
                            </span>
                        </span>
                    </p>
                  </div>
                </div>

                <div class="bg-surface-50 dark:bg-surface-800/50 p-5 rounded-2xl border border-surface-100 dark:border-surface-700">
                  <div class="flex items-center gap-2 mb-4 text-primary-600 dark:text-primary-400 font-bold">
                    <i class="pi pi-map-marker"></i> <span>Residential Address</span>
                  </div>
                  <div class="space-y-3">
                    <p class="flex justify-between"><span class="text-surface-500">Location:</span> <span class="font-medium">{{previewData.address.ward | titlecase }}, {{previewData.address.district | titlecase}}</span></p>
                    <p class="flex justify-between"><span class="text-surface-500">Region:</span> <span class="font-medium">{{previewData.address.region_id}}</span></p>
                    <p class="flex justify-between"><span class="text-surface-500">Post Code:</span> <span class="font-medium font-mono bg-surface-200 dark:bg-surface-700 px-2 rounded">{{previewData.address.post_code}}</span></p>
                    <p class="flex justify-between"><span class="text-surface-500">Street:</span> <span class="font-medium">{{previewData.address.street | titlecase}}</span></p>
                    <p class="flex justify-between"><span class="text-surface-500">House No:</span> <span class="font-medium">{{previewData.address.house_number | uppercase }}</span></p>
                    <p class="flex justify-between"><span class="text-surface-500">Plot Number:</span> <span class="font-medium">{{(previewData.address.plot_number | titlecase ) || 'N/A'}}</span></p>
                    <p class="flex justify-between"><span class="text-surface-500">Famous Name:</span> <span class="font-medium">{{(previewData.address.street_prominent_name | titlecase ) || 'N/A'}}</span></p>
                  </div>
                </div>

                <div class="md:col-span-2 bg-surface-50 dark:bg-surface-800/50 p-5 rounded-2xl border border-surface-100 dark:border-surface-700">
                  <div class="flex items-center gap-2 mb-4 text-primary-600 dark:text-primary-400 font-bold">
                    <i class="pi pi-users"></i> <span>Next of Kin ({{previewData.next_of_kin.length}})</span>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div *ngFor="let kin of previewData.next_of_kin; let i = index" class="p-3 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
                      <p class="font-bold text-sm">{{kin.first_name | uppercase}} {{kin.last_name | uppercase }}</p>
                      <p class="text-xs text-surface-500">{{kin.phone_number}}</p>
                      <p *ngIf="kin.email" class="text-xs text-surface-500 italic">{{kin.email}}</p>
                      <p class="text-xs text-surface-500">{{kin.physical_address | titlecase }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-start gap-3 p-5 bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800 rounded-2xl">
              <p-checkbox [(ngModel)]="termsAccepted" [binary]="true" inputId="acceptTerms" [ngModelOptions]="{standalone: true}"></p-checkbox>
              <label for="acceptTerms" class="text-sm leading-6 text-surface-700 dark:text-surface-300 cursor-pointer">
                I hereby certify that all information provided—including my <strong>Personal Details</strong>, <strong>Residential Address</strong>
                and <strong>Next of Kin</strong> details is accurate, up to date and I am ready to complete my registration.
              </label>
            </div>
          </div>

          <div class="flex justify-between mt-10 pt-6 border-t border-surface-200 dark:border-surface-800">
            <p-button label="Back" icon="pi pi-arrow-left" [text]="true" (click)="prevStep()" *ngIf="activeStep > 1"></p-button>
            <div class="ml-auto flex gap-3">
              <p-button label="Next" icon="pi pi-arrow-right" iconPos="right" (click)="nextStep()" *ngIf="activeStep < 5"></p-button>
              <p-button label="Skip Photo" icon="pi pi-forward" severity="secondary" (click)="nextStep()" *ngIf="activeStep === 4 && !profilePreview"></p-button>
              <p-button label="Complete Registration" severity="success" (click)="onSubmit()" [loading]="loading" [disabled]="!termsAccepted" *ngIf="activeStep === 5"></p-button>
            </div>
          </div>

        </form>

        </div>

        <div *ngIf="isSuccess" class="min-h-[50vh] flex flex-col items-center justify-between bg-white dark:bg-slate-900 dark:border-slate-800 overflow-hidden animate-fadein">

        <div class="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div class="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
            <i class="pi pi-check text-4xl text-green-600"></i>
          </div>

          <h1 class="text-surface-900 dark:text-surface-0 font-bold text-3xl lg:text-5xl mb-2">Congratulations</h1>
          <span class="text-primary font-bold text-3xl mb-4">{{registrationForm.get('personalInfo.title')?.value}}. {{previewFullName}}!</span>

          <p class="text-slate-500 dark:text-slate-400 max-w-md">
            Your profile is now fully registered. Would you like to update your security settings now or proceed to your dashboard?
          </p>
        </div>

        <div class="w-full flex border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 mb-4">
          <button
            (click)="changePassword()"
            class="flex-1 flex items-center justify-center gap-3 py-6 hover:bg-white dark:hover:bg-slate-800 transition-colors group border-r border-slate-100 dark:border-slate-800">
            <i class="pi pi-key text-xl text-slate-400 group-hover:text-primary-500 transition-colors"></i>
            <span class="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary-600">
              Change Password
            </span>
          </button>

          <button
            (click)="skipPassword()"
            class="flex-1 flex items-center justify-center gap-3 py-6 hover:bg-white dark:hover:bg-slate-800 transition-colors group">
            <i class="pi pi-arrow-right text-xl text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors"></i>
            <span class="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
              Skip for Now
            </span>
          </button>
        </div>
      </div>

          `,
      providers: [MessageService, ConfirmationService]
})
export class CompleteRegistration implements OnInit {

  activeStep = 1;
  maxSteps = 4;
  registrationForm!: FormGroup;
  regions: any[] = [];
  districts: any[] = [];
  wards: any[] = [];
  streets: any[] = [];
  titles = ['Mr', 'Ms', 'Mrs', 'Eng', 'Dr', 'Prof', 'Tech', 'Hon'];
  termsAccepted: boolean = false;
  loading = false;
  submitted = false;
  profilePreview: string | null = null;
  isManualStreet: boolean = false;
  isSuccess: boolean = false;
  maxDate: Date = new Date();

  constructor(private fb: FormBuilder, private masterService: Master, private messageService: MessageService, private router: Router) {}

  ngOnInit() {
    this.initForm();
    this.loadRegions();
    this.addNextOfKin();
  }

  initForm() {
    this.registrationForm = this.fb.group({
      personalInfo: this.fb.group({
        first_name: ['', [Validators.required, Validators.maxLength(30)]],
        middle_name: ['', [Validators.maxLength(100)]],
        last_name: ['', [Validators.required, Validators.maxLength(100)]],
        // email: ['', [Validators.email]],
        title: ['', [Validators.required]],
        phone_number: ['', [Validators.required]],
        birth_date: ['', [Validators.required, ageValidator(15)]],
        second_phone_number: [''],
        nationality: ['Tanzanian']
      }),
      address: this.fb.group({
        region_id: ['', [Validators.required]],
        district: [{ value: '', disabled: true }, [Validators.required]],
        ward: [{ value: '', disabled: true }, [Validators.required]],
        street: [{ value: '', disabled: true }, [Validators.required]],
        post_code: [{ value: '', disabled: true }, [Validators.required]],
        street_prominent_name: [''],
        house_number: ['', [Validators.required]],
        plot_number: [''],
      }),
      next_of_kin: this.fb.array([], [Validators.required, Validators.minLength(1)]),
      profile_picture: [null]
    });
  }

  loadRegions() {
    this.masterService.getLocations('regions').subscribe(data => this.regions = data);
  }

  onRegionChange(event: any) {
    const regionName = event.value;
    const address = this.registrationForm.get('address');

    if (regionName) {

      address?.get('district')?.reset();
      address?.get('ward')?.reset();
      address?.get('street')?.reset();
      address?.get('post_code')?.reset();

      address?.get('district')?.enable();
      address?.get('ward')?.disable();
      address?.get('street')?.disable();

      this.masterService.getLocations('districts', regionName).subscribe(data => {
        this.districts = data;
      });
    }
  }

  onDistrictChange(event: any) {
    const districtName = event.value;
    const regionName = this.registrationForm.get('address.region_id')?.value;
    const address = this.registrationForm.get('address');

    if (districtName) {
      address?.get('ward')?.reset();
      address?.get('street')?.reset();

      address?.get('ward')?.enable();
      address?.get('street')?.disable();

      this.masterService.getLocations('wards', regionName, districtName).subscribe(data => {
        this.wards = data;
      });
    }
  }

  onWardChange(event: any) {
    const wardName = event.value;
    const regionName = this.registrationForm.get('address.region_id')?.value;
    const districtName = this.registrationForm.get('address.district')?.value;
    const streetControl = this.registrationForm.get('address.street');

    if (wardName) {
      streetControl?.reset();
      streetControl?.enable();
      this.isManualStreet = false;

      const selectedWard = this.wards.find(w => w.name === wardName);
      if (selectedWard) {
        this.registrationForm.get('address.post_code')?.setValue(selectedWard.post_code);
      }

      this.masterService.getLocations('streets', regionName, districtName, wardName).subscribe({
        next: (data) => {
          this.streets = data;

          if (!data || data.length === 0) {
            this.isManualStreet = true;
          }
        },
        error: (err) => {

          console.warn('Streets not found, switching to manual entry');
          this.streets = [];
          this.isManualStreet = true;
        }
      });
    }
  }


  get previewData() {
    return this.registrationForm.getRawValue();
  }

  get nextOfKinGroups() {
    return (this.registrationForm.get('next_of_kin') as FormArray).controls as FormGroup[];
  }

  addNextOfKin() {
    const kinGroup = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      phone_number: ['', Validators.required],
      email: ['', [Validators.email]],
      physical_address: ['']
    });
    (this.registrationForm.get('next_of_kin') as FormArray).push(kinGroup);
  }

  removeNextOfKin(index: number) {
    (this.registrationForm.get('next_of_kin') as FormArray).removeAt(index);
  }

  nextStep() {
    const currentGroupName = this.activeStep === 1 ? 'personalInfo' : 'address';
    const currentGroup = this.registrationForm.get(currentGroupName);

    if (currentGroup?.valid) {
      this.activeStep++;
    } else {
      currentGroup?.markAllAsTouched();
    }
  }

  prevStep() { this.activeStep--; }

  getStepClass(step: number) {
    if (step === this.activeStep) return 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/30';
    if (step < this.activeStep) return 'bg-green-500 border-dark-500 text-white';
    return 'bg-white dark:bg-surface-800 border-surface-300 dark:border-surface-600 text-surface-400';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePreview = reader.result as string;
        this.registrationForm.get('profile_picture')?.setValue(file);
      };
      reader.readAsDataURL(file);
    }
  }

  get userInitials(): string {
    const firstName = this.registrationForm.get('personalInfo.first_name')?.value || '';
    const lastName = this.registrationForm.get('personalInfo.last_name')?.value || '';

    if (!firstName && !lastName) return '??';

    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  get previewFullName(): string {
    const p = this.previewData.personalInfo;
    const first = p.first_name?.toUpperCase() || '';
    const middle = p.middle_name?.trim();
    const last = p.last_name?.toUpperCase() || '';

    return middle
      ? `${first} ${middle.toUpperCase()} ${last}`
      : `${first} ${last}`;
  }

  get previewAge(): number | null {
      const birthDateValue = this.previewData.personalInfo.birth_date;
      if (!birthDateValue) return null;

      const birthDate = new Date(birthDateValue);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
  }

  onSubmit() {
    if (this.registrationForm.invalid || !this.termsAccepted) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Form Incomplete',
        detail: 'Please verify all fields.'
      });
      return;
    }

    this.loading = true;
    const rawData = this.registrationForm.getRawValue();

    this.masterService.completeRegistration(rawData).subscribe({
      next: (res) => {
        const successMessage = res.message || 'Registration completed successfully!';
        this.messageService.add({
          severity: 'success',
          summary: 'Congratulations!',
          detail: successMessage
        });
        this.loading = false;
        this.isSuccess = true;
      },
      error: (err) => {
          this.loading = false;

          let errorMessage = 'An unexpected error occurred.';

          if (err.error) {
              if (typeof err.error === 'string') {
                  errorMessage = err.error;
              } else if (err.error.detail) {
                  errorMessage = err.error.detail;
              } else if (typeof err.error === 'object') {

                  const firstKey = Object.keys(err.error)[0];
                  const firstError = err.error[firstKey];
                  errorMessage = Array.isArray(firstError) ? `${firstKey}: ${firstError[0]}` : firstError;
              }
          }

          this.messageService.add({
              severity: 'error',
              summary: 'Registration Failed',
              detail: errorMessage
          });
      }
    });
  }

  changePassword() {
    this.router.navigate(['/account/profile/change-password']);
  }

  skipPassword() {
    this.router.navigate(['/dashboard/main']);
  }

}
