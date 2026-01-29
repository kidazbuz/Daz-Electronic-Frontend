import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { Auth } from '../../shared/services/auth';
import { ROLE_MENU_MAP } from '../../shared/interfaces/nav.config';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})

export class AppMenu implements OnInit {

  model: MenuItem[] = [];

  constructor(private authService: Auth) {}

  ngOnInit() {

        const isCustomer = this.authService.userInGroup('Customer')

        const finalMenu: MenuItem[] = [
            {
                label: 'Home',
                items: [
                  { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard/main'] },
                  { label: 'Catalog', icon: 'pi pi-fw pi-th-large', routerLink: ['/dashboard/catalog'], visible: isCustomer },

                ]
            }
        ];

        const rolesInConfig = Object.keys(ROLE_MENU_MAP);

        rolesInConfig.forEach(role => {
            if (this.authService.userInGroup(role)) {
                finalMenu.push(...ROLE_MENU_MAP[role]);
            }
        });

        this.model = finalMenu;
    }

}
