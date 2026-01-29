import { Component, signal, OnInit, inject, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { finalize } from 'rxjs/operators';
import { IProductSpecification, IPaginatedSpecificationList } from '../../../shared/interfaces/product';
import { environment } from '../../../shared/environment/env_file';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { OrderListModule } from 'primeng/orderlist';
import { PickListModule } from 'primeng/picklist';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Specific } from './specific';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { Cart } from '../../../shared/services/cart';
import { Message } from '../../../shared/services/message';
import { Auth } from '../../../shared/services/auth';

@Component({
    selector: 'features-widget',
    standalone: true,
    imports: [CommonModule, OrderListModule, ToastModule, PickListModule, SelectButtonModule, TagModule, ButtonModule, RouterModule, FormsModule, DataViewModule],
    template: `

    <p-toast></p-toast>

    <section class="section-container px-4 py-8 max-w-[1440px] mx-auto">
    <div class="card border-none bg-transparent">
        <div class="flex justify-between items-center mb-6">
            <div class="text-surface-900 dark:text-surface-0 font-normal mb-2 text-4xl">Pick Your Favorite Product</div>

            <p-select-button [(ngModel)]="layout" [options]="options" [allowEmpty]="false">
                <ng-template #item let-option>
                    <i class="pi" [ngClass]="{ 'pi-bars': option === 'list', 'pi-table': option === 'grid' }"></i>
                </ng-template>
            </p-select-button>
        </div>

        <p-dataview [value]="products" [layout]="layout">

            <ng-template #list let-items>
                <div class="flex flex-col">
                <div *ngFor="let item of items; let i = index">
                    <div class="flex flex-col sm:flex-row sm:items-center p-6 gap-6 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                         [routerLink]="['/der/product', item.id]"
                         [ngClass]="{ 'border-t border-gray-100 dark:border-slate-800': i !== 0 }">

                        <div class="md:w-48 relative flex-shrink-0">
                            <img class="block mx-auto rounded-lg w-full object-cover h-40"
                                 [src]="item.images.length > 0 ? item.images[0].image : 'https://placehold.co/400x300/a5b4fc/4338ca?text=Product'"
                                 [alt]="item.parent_product_name" />
                        </div>

                        <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-4">
                          <div class="flex flex-col gap-1">
                              <span class="text-sm font-medium text-primary uppercase tracking-wider">{{ item.product_base_name }}</span>
                              <div class="text-xl font-bold text-slate-800 dark:text-white no-underline hover:text-primary transition-colors">
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
                                <p-button *ngIf="isAuthenticated()" icon="pi pi-shopping-cart"
                                          [rounded]="true"
                                          (onClick)="$event.stopPropagation(); addToCart(item)">
                                </p-button>
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
                  <div (click)="goToProduct(item.id)"
                       class="group p-4 border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl flex flex-col h-full shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">

                    <div class="relative w-full aspect-[4/3] overflow-hidden rounded-lg bg-gray-50">
                      <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                           [src]="item.images.length > 0 ? item.images[0].image : 'https://placehold.co/400x300/a5b4fc/4338ca?text=Product'"
                           [alt]="item.parent_product_name" />

                    </div>

                    <div class="flex flex-col flex-1 pt-4">
                      <div class="flex flex-col gap-1 mb-4">
                        <div class="font-semibold text-xl mb-2">{{ item.product_base_name }}</div>

                        <div class="flex justify-between items-center">
                          <p class="text-sm text-slate-500 line-clamp-1">Model: {{ item.model }}</p>
                          @if (item.discount_percentage > 0) {
                            <span class="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded">
                              {{ item.discount_percentage }}% OFF
                            </span>
                          }
                        </div>
                      </div>

                      <div class="mt-auto pt-4 border-t border-gray-50 dark:border-slate-800">
                        <div class="flex justify-between items-center">
                          <div class="flex flex-col">
                            <span class="text-xl font-black text-slate-900 dark:text-white">
                              {{ item.discounted_price | currency: 'TZS ': 'symbol':'1.0-0' }}
                            </span>

                            <span class="text-sm font-medium text-slate-400 line-through">
                              {{ item.actual_price | currency: 'TZS ': 'symbol':'1.0-0' }}
                            </span>
                          </div>

                          <div class="flex gap-2">
                            <p-button *ngIf="isAuthenticated()" icon="pi pi-shopping-cart"
                                      [rounded]="true"
                                      (onClick)="$event.stopPropagation(); addToCart(item)">
                            </p-button>
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
              </div>
            </ng-template>
        </p-dataview>

        <div *ngIf="isLoading()" class="flex flex-col items-center justify-center py-12">
            <i class="pi pi-spinner pi-spin text-4xl text-primary"></i>
            <p class="mt-4 text-slate-500 font-medium">Loading more products...</p>
        </div>

        @if (!isAuthenticated() && !nextPageUrl && products.length > 0 && !isLoading()) {
          <div class="mt-14 mb-3 p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-surface-50 dark:bg-surface-900/50 text-center">
              <div class="flex flex-col items-center gap-4 max-w-xl mx-auto">
                  <div class="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-2">
                      <i class="pi pi-sparkles text-primary-600 text-2xl"></i>
                  </div>

                  <h3 class="text-xl font-bold text-slate-900 dark:text-white">
                      Want to see more tailored deals?
                  </h3>
                  <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Sign in to your account to unlock personalized recommendations and explore our full range of products specifically chosen for you.
                  </p>

                  <div class="flex flex-col sm:flex-row gap-3 mt-4 w-full sm:w-auto">
                      <p-button label="Sign In"
                                (click)="goToLogin()"
                                styleClass="p-button-primary px-8">
                      </p-button>
                      <p-button label="Create Account"
                                (click)="goToRegister()"
                                styleClass="p-button-outlined px-8">
                      </p-button>
                  </div>

                  <button (click)="scrollToTop()" class="mt-2 text-sm font-medium text-slate-400 hover:text-primary transition-colors bg-transparent border-none cursor-pointer">
                      Maybe later, take me to top ↑
                  </button>
              </div>
          </div>
      }
    </div>
</section>`,
changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturesWidget implements OnInit {

  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(Auth);
  private cartService = inject(Cart);
  private notify = inject(Message);
  private apiUrl = environment.apiUrl;

  layout: 'list' | 'grid' = 'grid';
  options = ['list', 'grid'];

  private initialUrl = `${this.apiUrl}products/public-catalog/`;
  nextPageUrl: string | null = this.initialUrl;
  private loadedIds = new Set<number>();

  isLoading = signal(false);
  isAuthenticated = signal<boolean>(false);
  products: IProductSpecification[] = [];
  product: IProductSpecification | undefined;
  quantity: number = 1;
  selectedSize: string = '';
  selectedColor: string = '';

  ngOnInit() {

    this.checkUserAuthStatus()
    this.loadNextPage();

  }

  checkUserAuthStatus(){

    if(this.authService.getAuthenticatedUser()){
      return this.isAuthenticated.set(true);
    }

    return this.isAuthenticated.set(false);

  }

  loadNextPage(): void {
    if (this.isLoading() || !this.nextPageUrl) return;

    this.isLoading.set(true);

    this.http.get<IPaginatedSpecificationList>(this.nextPageUrl)
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe(res => {
        const incomingResults = res.results;
        const newProducts: IProductSpecification[] = [];

        for (const item of incomingResults) {
          if (!this.loadedIds.has(item.id)) {
            newProducts.push(item);
            this.loadedIds.add(item.id);
          }
        }

        this.products = [...this.products, ...newProducts];
        this.nextPageUrl = res.next;
      });
  }


  @HostListener('window:scroll', [])
  onScroll(): void {
    const SCROLL_THRESHOLD = 500;
    const currentScrollPosition = window.scrollY + window.innerHeight;
    const totalDocumentHeight = document.documentElement.scrollHeight;

    if (currentScrollPosition >= totalDocumentHeight - SCROLL_THRESHOLD) {
      this.loadNextPage();
    }
  }

  getSeverity(product: IProductSpecification) {
    return 'success';
  }

  goToProduct(id: number) {
    if(this.isAuthenticated()){
      this.router.navigate(['/dashboard/catalog', id]);
    }else{
      this.router.navigate(['/der/product', id]);
    }

  }

  goToLogin() {
    this.router.navigate(['/account/login']);
  }

  goToRegister() {
    this.router.navigate(['/account/register']);
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
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

}
