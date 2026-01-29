import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { IBestSellerItem } from '../../../shared/interfaces/analytics';


@Component({
    standalone: true,
    selector: 'app-best-selling-widget',
    imports: [CommonModule, ButtonModule, MenuModule],
    template: ` <div class="card">
        <div class="flex justify-between items-center mb-6">
            <div class="font-semibold text-xl">Best Selling Products</div>
            <div>
                <button pButton type="button" icon="pi pi-ellipsis-v" class="p-button-rounded p-button-text p-button-plain" (click)="menu.toggle($event)"></button>
                <p-menu #menu [popup]="true" [model]="items"></p-menu>
            </div>
        </div>

        <ul class="list-none p-0 m-0">
            <li *ngFor="let seller of sellers()" class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <span class="text-surface-900 dark:text-surface-0 font-medium mr-2 mb-1 md:mb-0">{{ seller.name }}</span>
                    <div class="mt-1 text-muted-color">{{ seller.category }}</div>
                </div>
                <div class="mt-2 md:mt-0 flex items-center">
                    <div class="bg-surface-300 dark:bg-surface-500 rounded-border overflow-hidden w-40 lg:w-24" style="height: 8px">
                      <div
                          [class]="'bg-' + seller.color + '-500 h-full'"
                          [style.width.%]="seller.percentage">
                      </div>
                    </div>
                    <span class="text-orange-500 ml-4 font-medium">%{{ seller.percentage }}</span>
                </div>
            </li>
        </ul>
    </div>`
})
export class BestSellingWidget {

    sellers = input<IBestSellerItem[]>();

    menu = null;

    items = [
        { label: 'Add New', icon: 'pi pi-fw pi-plus' },
        { label: 'Remove', icon: 'pi pi-fw pi-trash' }
    ];
}
