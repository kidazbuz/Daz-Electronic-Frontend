import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseProductList } from './base';
import { Master } from '../../../shared/services/master';
import { Cart } from '../../../shared/services/cart';
import { Message } from '../../../shared/services/message';
import { IProductSpecification } from '../../../shared/interfaces/product';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DataViewModule } from 'primeng/dataview';
import { DrawerModule } from 'primeng/drawer';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SliderModule } from 'primeng/slider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-listing',
    standalone: true,
    imports: [
        CommonModule, ToastModule, FormsModule, RouterLink, ButtonModule, DataViewModule,
        DrawerModule, CheckboxModule, SelectButtonModule, SliderModule, SkeletonModule
    ],
    template: `

    <p-toast></p-toast>

    <div class="max-w-[1440px] mx-auto px-4 lg:px-10 py-8 transition-colors duration-300">
    <div class="grid grid-cols-12 gap-6 items-start">

        <div class="hidden lg:block lg:col-span-3 sticky top-8 self-start">
            <ng-container *ngTemplateOutlet="filterContent"></ng-container>
        </div>

        <div class="col-span-12 lg:col-span-9">

            <div class="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-surface-200 dark:border-surface-700 rounded-xl p-3 mb-6 flex justify-between items-center">

                <div class="flex items-center gap-2 sm:gap-4 min-w-0">
                    <p-button
                        icon="pi pi-filter"
                        class="lg:hidden flex-shrink-0"
                        (onClick)="displayFilter = true"
                        severity="secondary"
                        [outlined]="true"
                        size="small">
                    </p-button>

                    <h6 class="text-base sm:text-xl lg:text-2xl font-bold m-0 text-slate-800 dark:text-slate-100 truncate">
                        {{ categoryDisplayName | titlecase }}
                    </h6>
                </div>

                <div class="flex-shrink-0">
                    <p-select-button [(ngModel)]="layout" [options]="options" [allowEmpty]="false">
                        <ng-template #item let-option>
                            <i class="pi" [ngClass]="{ 'pi-bars': option === 'list', 'pi-table': option === 'grid' }"></i>
                        </ng-template>
                    </p-select-button>
                </div>
            </div>

            @if (isLoading()) {
                <div class="grid grid-cols-12 gap-4">
                    <div *ngFor="let i of [1,2,3]" class="col-span-12 sm:col-span-6 xl:col-span-4 p-4 border border-surface-200 dark:border-surface-700 rounded-xl bg-white dark:bg-slate-800">
                        <p-skeleton width="100%" height="200px" styleClass="mb-4"></p-skeleton>
                        <p-skeleton width="80%" height="1.5rem" styleClass="mb-2"></p-skeleton>
                        <p-skeleton width="40%" height="1rem"></p-skeleton>
                    </div>
                </div>
            }

            @else if (products.length === 0) {
                <div class="mt-14 mb-3 p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-surface-50 dark:bg-surface-900/50 text-center">
                    <div class="flex flex-col items-center gap-4 max-w-xl mx-auto">
                        <div class="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-2">
                            <i class="pi pi-search text-primary-600 text-2xl"></i>
                        </div>

                        <h3 class="text-xl font-bold text-slate-900 dark:text-white">
                            No matches found
                        </h3>
                        <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
                            We couldn't find any products matching your current criteria/Category. Try adjusting your filters or search terms.
                        </p>

                        <div class="flex flex-col sm:flex-row gap-3 mt-4 w-full sm:w-auto">
                            <p-button label="Clear Filters"
                                      (click)="resetFilters()"
                                      styleClass="p-button-primary px-8">
                            </p-button>
                        </div>

                        <button (click)="redirectHome()" class="mt-2 text-sm font-medium text-slate-400 hover:text-primary transition-colors bg-transparent border-none cursor-pointer">
                            Take me to Home ↑
                        </button>
                    </div>
                </div>
            }

            @else {
              <p-dataView [value]="products" [layout]="layout">
                    <ng-template #list let-items>
                        <div class="flex flex-col">
                            <div *ngFor="let item of items; let i = index">
                                <div class="flex flex-col sm:flex-row sm:items-center p-6 gap-6 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                                     [routerLink]="['/der/product', item.id]"
                                     [ngClass]="{ 'border-t border-gray-100 dark:border-slate-800': i !== 0 }">

                                    <div class="md:w-48 relative flex-shrink-0">
                                        <img class="block mx-auto rounded-lg w-full object-cover h-40 group-hover:scale-105 transition-transform duration-500"
                                             [src]="item.images?.length > 0 ? item.images[0].image : 'https://placehold.co/400x300/a5b4fc/4338ca?text=Product'"
                                             [alt]="item.parent_product_name" />
                                    </div>

                                    <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-4">
                                        <div class="flex flex-col gap-1">
                                            <span class="text-sm font-medium text-primary uppercase tracking-wider">{{ item.product_base_name }}</span>
                                            <div class="text-xl font-bold text-slate-800 dark:text-white no-underline group-hover:text-primary transition-colors">
                                                {{ item.model }}
                                            </div>
                                            <span class="text-slate-500 text-sm" *ngIf="item.brand_name">{{ item.brand_name | titlecase }}</span>
                                            <div class="flex items-center gap-2 mt-2">
                                                <i class="pi pi-tag text-slate-400"></i>
                                                <span class="text-slate-500 text-sm">{{ item.parent_category_name | titlecase }}</span>
                                            </div>
                                        </div>

                                        <div class="flex flex-col md:items-end gap-1">
                                            <span class="text-2xl font-bold text-slate-900 dark:text-white">
                                                {{ item.discounted_price | currency: 'TZS ': 'symbol':'1.0-0' }}
                                            </span>

                                            <div class="flex items-center gap-2">
                                                <span class="text-sm text-slate-400 line-through font-medium">
                                                    {{ item.actual_price | currency: 'TZS ': 'symbol':'1.0-0' }}
                                                </span>

                                                @if (item.discount_percentage > 0) {
                                                    <span class="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">
                                                        -{{ item.discount_percentage }}%
                                                    </span>
                                                }
                                            </div>
                                            <div class="flex gap-2 mt-4">
                                              <p-button icon="pi pi-shopping-cart"
                                                        [rounded]="true"
                                                        (onClick)="$event.stopPropagation(); addToCart(item)">
                                              </p-button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ng-template>

                    <ng-template #grid let-items>
                        <div class="grid grid-cols-12 gap-4">
                            <div *ngFor="let item of items" class="col-span-12 sm:col-span-6 lg:col-span-4 p-2">
                                <div class="group p-4 border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl flex flex-col h-full shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                     [routerLink]="['/der/product', item.id]">

                                    <div class="relative w-full aspect-[4/3] overflow-hidden rounded-lg bg-gray-50 dark:bg-slate-800">
                                        <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                             [src]="item.images?.length > 0 ? item.images[0].image : 'https://placehold.co/400x300/a5b4fc/4338ca?text=Product'"
                                             [alt]="item.parent_product_name" />

                                        @if (item.discount_percentage > 0) {
                                            <div class="absolute top-2 right-2">
                                                <span class="text-xs font-bold bg-red-500 text-white px-2 py-1 rounded-full shadow-lg">
                                                    {{ item.discount_percentage }}% OFF
                                                </span>
                                            </div>
                                        }
                                    </div>

                                    <div class="flex flex-col flex-1 pt-4">
                                        <div class="flex flex-col gap-1 mb-4">
                                            <span class="text-xs font-semibold text-primary uppercase">{{ item.brand_name }}</span>
                                            <div class="font-bold text-lg text-slate-800 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                                                {{ item.product_base_name }}
                                            </div>
                                            <p class="text-sm text-slate-500 line-clamp-1">Model: {{ item.model }}</p>
                                        </div>

                                        <div class="mt-auto pt-4 border-t border-gray-50 dark:border-slate-800 flex justify-between items-end">
                                            <div class="flex flex-col">
                                                <span class="text-xl font-black text-slate-900 dark:text-white">
                                                    {{ item.discounted_price | currency: 'TZS ': 'symbol':'1.0-0' }}
                                                </span>
                                                <span class="text-sm font-medium text-slate-400 line-through">
                                                    {{ item.actual_price | currency: 'TZS ': 'symbol':'1.0-0' }}
                                                </span>
                                            </div>

                                            <p-button icon="pi pi-shopping-cart"
                                                      [rounded]="true"
                                                      (onClick)="$event.stopPropagation(); addToCart(item)">
                                            </p-button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ng-template>
                  </p-dataView>
            }
        </div>
    </div>
</div>

<p-drawer [(visible)]="displayFilter"
          position="left"
          [blockScroll]="true"
          [modal]="true"
          [showCloseIcon]="false"
          appendTo="body"
          styleClass="w-[85vw] sm:w-[320px] !bg-white dark:!bg-slate-900 shadow-2xl !z-[9999]">

    <div class="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
        <h3 class="text-xl font-bold dark:text-white m-0">Filters</h3>
        <p-button
            icon="pi pi-times"
            [rounded]="true"
            [text]="true"
            severity="secondary"
            (onClick)="displayFilter = false">
        </p-button>
    </div>

    <div class="p-5 overflow-y-auto h-[calc(100vh-80px)]">
        <ng-container *ngTemplateOutlet="filterContent"></ng-container>

        <div class="h-20 lg:hidden"></div>
    </div>
</p-drawer>

<ng-template #filterContent>
    <div class="bg-white dark:bg-slate-900 lg:p-1 space-y-8">
        <div class="flex justify-between items-center mb-6">
            <span class="text-lg font-bold dark:text-white">Filters</span>
            <p-button label="Reset All" [link]="true" size="small" (onClick)="resetFilters()"></p-button>
        </div>

        <div *ngIf="filterOptions.price_range">
            <span class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Price Range</span>
            <div class="flex justify-between text-xs font-bold mb-4 dark:text-slate-300">
                <span>{{ priceRange[0] | currency }}</span>
                <span>{{ priceRange[1] | currency }}</span>
            </div>
            <p-slider [(ngModel)]="priceRange" [range]="true"
                      [min]="filterOptions.price_range.min"
                      [max]="filterOptions.price_range.max"
                      (onSlideEnd)="applyFilters()">
            </p-slider>
        </div>

        <div class="space-y-8">
            <div *ngIf="filterOptions.brands?.length">
                <span class="block text-xs font-bold text-slate-400 uppercase mb-4">Brands</span>
                <div class="flex flex-col gap-3">
                    <div *ngFor="let b of filterOptions.brands" class="flex items-center gap-3">
                        <p-checkbox [value]="b.id.toString()" [(ngModel)]="activeFilters.brand" [inputId]="'br'+b.id" (ngModelChange)="applyFilters()"></p-checkbox>
                        <label [for]="'br'+b.id" class="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">{{b.name}}</label>
                    </div>
                </div>
            </div>

            <div *ngIf="filterOptions.screen_sizes?.length">
                <span class="block text-xs font-bold text-slate-400 uppercase mb-4">Screen Size</span>
                <div class="flex flex-col gap-3">
                    <div *ngFor="let s of filterOptions.screen_sizes" class="flex items-center gap-3">
                        <p-checkbox [value]="s.id.toString()" [(ngModel)]="activeFilters.screen_size" [inputId]="'sz'+s.id" (ngModelChange)="applyFilters()"></p-checkbox>
                        <label [for]="'sz'+s.id" class="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">{{s.name}} Inch</label>
                    </div>
                </div>
            </div>

            <div *ngIf="filterOptions.resolutions?.length">
                <span class="block text-xs font-bold text-slate-400 uppercase mb-4">Resolution</span>
                <div class="flex flex-col gap-3">
                    <div *ngFor="let r of filterOptions.resolutions" class="flex items-center gap-3">
                        <p-checkbox [value]="r.id.toString()" [(ngModel)]="activeFilters.resolutions" [inputId]="'res'+r.id" (ngModelChange)="applyFilters()"></p-checkbox>
                        <label [for]="'res'+r.id" class="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">{{r.name}}</label>
                    </div>
                </div>
            </div>

            <div *ngIf="filterOptions.panel_types?.length">
                <span class="block text-xs font-bold text-slate-400 uppercase mb-4">Panel Type</span>
                <div class="flex flex-col gap-3">
                    <div *ngFor="let p of filterOptions.panel_types" class="flex items-center gap-3">
                        <p-checkbox [value]="p.id.toString()" [(ngModel)]="activeFilters.panel_types" [inputId]="'pt'+p.id" (ngModelChange)="applyFilters()"></p-checkbox>
                        <label [for]="'pt'+p.id" class="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">{{p.name}}</label>
                    </div>
                </div>
            </div>

            <div *ngIf="filterOptions.internet_services?.length">
                <span class="block text-xs font-bold text-slate-400 uppercase mb-4">Internet Services</span>
                <div class="flex flex-col gap-3">
                    <div *ngFor="let i of filterOptions.internet_services" class="flex items-center gap-3">
                        <p-checkbox [value]="i.id.toString()" [(ngModel)]="activeFilters.internet_services" [inputId]="'is'+i.id" (ngModelChange)="applyFilters()"></p-checkbox>
                        <label [for]="'is'+i.id" class="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">{{i.name}}</label>
                    </div>
                </div>
            </div>

            <div *ngIf="filterOptions.connectivity?.length">
                <span class="block text-xs font-bold text-slate-400 uppercase mb-4">Connectivity</span>
                <div class="flex flex-col gap-3">
                    <div *ngFor="let c of filterOptions.connectivity" class="flex items-center gap-3">
                        <p-checkbox [value]="c.id.toString()" [(ngModel)]="activeFilters.connectivity" [inputId]="'con'+c.id" (ngModelChange)="applyFilters()"></p-checkbox>
                        <label [for]="'con'+c.id" class="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">{{c.name}}</label>
                    </div>
                </div>
            </div>

            <div *ngIf="filterOptions.smart_features_available?.includes(true)">
                <span class="block text-xs font-bold text-slate-400 uppercase mb-4">Smart Technology</span>
                <div class="flex items-center gap-3">
                    <p-checkbox [(ngModel)]="activeFilters.smart_features" [binary]="true" inputId="smart_toggle" (ngModelChange)="applyFilters()"></p-checkbox>
                    <label for="smart_toggle" class="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Smart TV Features</label>
                </div>
            </div>
        </div>
    </div>
</ng-template>
    `
})
export class Listing extends BaseProductList implements OnInit {
    private route = inject(ActivatedRoute);
    private service = inject(Master);
    private cartService = inject(Cart);
    private notify = inject(Message);

    displayFilter: boolean = false;
    layout: 'list' | 'grid' = 'grid';
    options = ['list', 'grid'];
    currentCategory: string | null = null;
    filterOptions: any = {};
    priceRange: number[] = [0, 10000000];

    product: IProductSpecification | undefined;
    quantity: number = 1;
    selectedSize: string = '';
    selectedColor: string = '';

    activeFilters = {
        brand: [] as string[],
        screen_size: [] as string[],
        resolutions: [] as string[],
        panel_types: [] as string[],
        internet_services: [] as string[],
        connectivity: [] as string[],
        smart_features: false
    };

    productStats = [
        { label: 'Total Items', count: '0' },
        { label: 'In Stock', count: '0' },
        { label: 'On Sale', count: '0' }
    ];

    get categoryDisplayName(): string {
        return this.currentCategory ? this.currentCategory.replace(/-/g, ' ') : 'All Products';
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.getProductFilters();
        this.route.url.subscribe(segments => {
            this.currentCategory = segments[0]?.path || null;
            this.applyFilters();
        });
    }

    getProductFilters(): void {
        this.service.getProductFilters().subscribe(data => {
            this.filterOptions = data;
            if (data.price_range) this.priceRange = [data.price_range.min, data.price_range.max];
        });
    }

    applyFilters(): void {
        const params: any = {};
        if (this.currentCategory) params.category_slug = this.currentCategory;
        if (this.activeFilters.brand.length) params.brand = this.activeFilters.brand.join(',');
        if (this.activeFilters.screen_size.length) params.screen_size = this.activeFilters.screen_size.join(',');
        if (this.activeFilters.smart_features) params.smart_features = 'true';
        params.min_price = this.priceRange[0];
        params.max_price = this.priceRange[1];

        (this as any).activeQueryParams = params;
        this.products = [];
        this.resetAndSetCategoryUrl(this.currentCategory);
        this.loadNextPage();
        this.displayFilter = false;
    }

    resetFilters(): void {
      this.activeFilters = {
          brand: [],
          screen_size: [],
          resolutions: [],
          panel_types: [],
          internet_services: [],
          connectivity: [],
          smart_features: false
      };
        if (this.filterOptions.price_range) this.priceRange = [this.filterOptions.price_range.min, this.filterOptions.price_range.max];
        this.applyFilters();
    }

    addToCart(item: any): void {
      this.product = item;
      if (this.product && this.quantity > 0) {
        this.cartService.addItem(
          this.product,
          this.quantity,
          this.selectedColor,
          this.selectedSize
        );

        this.notify.success(`${this.product.parent_product_name} added successfully!`, 'Added to Cart');
      } else {
        this.notify.error('Please select a quantity greater than zero.', 'Quantity Required');
      }
    }

    redirectHome(){
      return this.router.navigate(['/'])
    }
}
