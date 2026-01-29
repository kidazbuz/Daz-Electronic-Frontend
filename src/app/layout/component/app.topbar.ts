import { Component, inject, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { LayoutService } from '../service/layout.service';
import { Copyright } from '../../pages/user-pages/copyright';
import { Auth } from '../../shared/services/auth';
import { User } from '../../shared/interfaces/user';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, Copyright, CommonModule, ButtonModule, DialogModule, StyleClassModule, AppConfigurator],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/dashboard/main">

                <span>Daz Electronics</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
                <div class="relative">
                    <button
                        class="layout-topbar-action layout-topbar-action-highlight"
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout"
                        [hideOnOutsideClick]="true"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <app-configurator />
                </div>
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-calendar"></i>
                        <span>Calendar</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-inbox"></i>
                        <span>Messages</span>
                    </button>
                    <button type="button" (click)="open()" class="layout-topbar-action">
                        <i class="pi pi-user"></i>
                        <span>Profile</span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <p-dialog [(visible)]="display" [breakpoints]="{ '960px': '75vw' }" [style]="{ width: '30vw' }" [modal]="true">
      <div class="bg-white dark:bg-slate-900 p-6 w-full max-w-sm rounded-2xl overflow-hidden mx-auto transition-colors">
        <div class="flex flex-col items-center">
          <div class="relative inline-block">
          <div class="relative w-fit"> <div class="min-h-[110px]">
          <img *ngIf="user?.profile_picture?.image"
     [src]="user?.profile_picture?.image"
     class="w-32 h-32 rounded-full border-4 border-white dark:border-surface-700 shadow-md object-cover mb-4" />

<div *ngIf="!user?.profile_picture?.image"
     class="w-32 h-32 rounded-full border-4 border-white dark:border-surface-700 shadow-md mb-4 flex items-center justify-center bg-primary-500 text-white text-4xl font-bold tracking-tighter">
     {{ userInitials }}
</div>
            </div>

            <button class="absolute bottom-1 right-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 transition-colors">
              <i class="pi pi-camera text-slate-600 dark:text-slate-300 text-xs"></i>
            </button>
            </div>
          </div>

          <div class="mt-4 text-center">
            <p class="text-lg text-slate-900 dark:text-white font-semibold">
              Hi, {{ (user?.first_name | titlecase) || user?.email || 'User' }}!
            </p>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {{ user?.groups?.[0] || 'Member' }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex justify-center px-5 py-3 mb-6">
        <p-button
            label="Manage Account"
            (click)="openManageAccount()"
            severity="contrast"
            [outlined]="true"
            size="large"
            styleClass="px-8 py-3 font-bold rounded-full border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200" />
      </div>

      <div class="flex border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <button (click)="openSettingsPage()" class="flex-1 flex items-center justify-center gap-2 py-4 hover:bg-white dark:hover:bg-slate-800 transition-colors group">
          <i class="pi pi-cog text-slate-500 group-hover:text-dark-500"></i>
          <p class="leading-normal m-0">Settings</p>
        </button>

        <button (click)="logout()" class="flex-1 flex items-center justify-center gap-2 py-4 hover:bg-white dark:hover:bg-slate-800 transition-colors group">
          <i class="pi pi-sign-out text-slate-500 group-hover:text-red-500"></i>
          <p class="leading-normal m-0">Sign out</p>
        </button>
      </div>

      <ng-template #footer>
        <div class="flex justify-center items-center w-full">
          <app-copyright />
        </div>
      </ng-template>
    </p-dialog>


    `
})
export class AppTopbar implements OnInit {

    items!: MenuItem[];
    display: boolean = false;
    user: User | null = null;

    constructor(public layoutService: LayoutService, private authService: Auth, private router: Router) {}

    ngOnInit() {

      const authenticatedUser = this.authService.getAuthenticatedUser();
      if (authenticatedUser) {
        this.user = authenticatedUser;
      }

    }

    get userInitials(): string {

      const first = this.user?.first_name?.[0] || '';
      const last = this.user?.last_name?.[0] || '';

      const initials = (first + last).toUpperCase();

      return initials || this.user?.email?.[0].toUpperCase() || '?';
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }


    open() {
        this.display = true;
    }

    close() {
        this.display = false;
    }

    openSettingsPage() {
        this.router.navigate(['/dashboard/profile/settings']);
        this.close()
    }

    openManageAccount() {
        this.router.navigate(['/dashboard/profile/me']);
        this.close()
    }

    logout() {
        this.authService.logout();
    }
}
