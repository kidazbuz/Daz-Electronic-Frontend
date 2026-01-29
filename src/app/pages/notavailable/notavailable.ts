import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Location } from '@angular/common';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { Copyright } from '../user-pages/copyright';
import { Auth } from '../../shared/services/auth';


@Component({
    selector: 'app-notavailable',
    standalone: true,
    imports: [AppFloatingConfigurator, ButtonModule, Copyright],
    template: ` <app-floating-configurator />
        <div class="flex items-center justify-center min-h-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">

                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, color-mix(in srgb, var(--primary-color), transparent 60%) 10%, var(--surface-ground) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-8 px-4 sm:px-10 flex flex-col items-center" style="border-radius: 53px">

                        <h1 class="text-surface-900 dark:text-surface-0 font-bold text-3xl lg:text-5xl mb-2">Not Available</h1>
                        <div class="text-surface-600 dark:text-surface-200 mb-8">We're very sorry this service is currently not Available.</div>
                        <a routerLink="/" class="w-full flex items-center py-8 border-surface-300 dark:border-surface-500 border-b">
                            <span class="flex justify-center items-center border-2 border-primary text-primary rounded-border" style="height: 3.5rem; width: 3.5rem">
                                <i class="pi pi-fw pi-table text-2xl!"></i>
                            </span>
                            <span class="ml-6 flex flex-col">
                                <span class="text-surface-900 dark:text-surface-0 lg:text-xl font-medium mb-0 block">Frequently Asked Questions</span>
                                <span class="text-surface-600 dark:text-surface-200 lg:text-xl">Ultricies mi quis hendrerit dolor.</span>
                            </span>
                        </a>
                        <a routerLink="/" class="w-full flex items-center py-8 border-surface-300 dark:border-surface-500 border-b">
                            <span class="flex justify-center items-center border-2 border-primary text-primary rounded-border" style="height: 3.5rem; width: 3.5rem">
                                <i class="pi pi-fw pi-question-circle text-2xl!"></i>
                            </span>
                            <span class="ml-6 flex flex-col">
                                <span class="text-surface-900 dark:text-surface-0 lg:text-xl font-medium mb-0">Solution Center</span>
                                <span class="text-surface-600 dark:text-surface-200 lg:text-xl">Phasellus faucibus scelerisque eleifend.</span>
                            </span>
                        </a>
                        <a routerLink="/" class="w-full flex items-center mb-8 py-8 border-surface-300 dark:border-surface-500 border-b">
                            <span class="flex justify-center items-center border-2 border-primary text-primary rounded-border" style="height: 3.5rem; width: 3.5rem">
                                <i class="pi pi-fw pi-unlock text-2xl!"></i>
                            </span>
                            <span class="ml-6 flex flex-col">
                                <span class="text-surface-900 dark:text-surface-0 lg:text-xl font-medium mb-0">Permission Manager</span>
                                <span class="text-surface-600 dark:text-surface-200 lg:text-xl">Accumsan in nisl nisi scelerisque</span>
                            </span>
                        </a>
                        @if(isAuthenticated()){
                          <p-button label="Go to Dashboard" (click)="redirectBack()" />
                        }@else{
                          <p-button label="Go Back" (click)="redirectBack()" />
                        }

                    </div>
                </div>
            </div>
        </div>
        <app-copyright />`
})
export class NotAvailable implements OnInit {

  private authService = inject(Auth);
  private router = inject(Router);
  private location = inject(Location);
  isAuthenticated = signal<boolean>(false);

  ngOnInit(): void {
    this.ckeckUserAuthStatus()
  }

  ckeckUserAuthStatus(){

    if(this.authService.getAuthenticatedUser()){
      return this.isAuthenticated.set(true);
    }

    return this.isAuthenticated.set(false);

  }

  redirectBack() {

      const historyState = window.history.length;

      if (historyState > 1) {
          this.location.back();
      } else {
          const fallback = this.isAuthenticated() ? '/dashboard/main' : '/';
          this.router.navigate([fallback]);
      }
  }

}
