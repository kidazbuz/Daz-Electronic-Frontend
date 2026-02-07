import { Component, OnInit, OnDestroy, AfterViewInit, signal } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { EMPTY, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { IProductSpecification, IProductRecommendation } from '../../../shared/interfaces/product';
import { Master } from '../../../shared/services/master';
import { Cart } from '../../../shared/services/cart';
import { Message } from '../../../shared/services/message';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { GalleriaModule } from 'primeng/galleria';
import { RouterLink } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { AccordionModule } from 'primeng/accordion';
import { FieldsetModule } from 'primeng/fieldset';
import { ImageModule } from 'primeng/image';
import { Auth } from '../../../shared/services/auth';


declare const Drift: any;
declare const GLightbox: any;
declare const AOS: any;

@Component({
    selector: 'app-specific',
    imports: [FormsModule, ImageModule, FieldsetModule, AccordionModule, DialogModule, TabsModule, CommonModule, ToastModule, GalleriaModule, RouterLink, SkeletonModule, TagModule, ButtonModule],
    template: `

    <p-toast></p-toast>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 transition-colors duration-500" *ngIf="product">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">

            <div class="space-y-6">
              <div class="relative overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40 dark:shadow-none">

                <p-galleria
                  [value]="galleriaImages"
                  [responsiveOptions]="galleriaResponsiveOptions"
                  [containerStyle]="{ 'width': '100%' }"
                  [numVisible]="5"
                  [circular]="true"
                  [showItemNavigators]="true"
                  styleClass="custom-product-galleria">

                  <ng-template #item let-item>
                    <div class="main-image-container relative w-full flex justify-center p-6 md:p-12 bg-white dark:bg-slate-900">

                      <p-image
                        [src]="item.itemImageSrc"
                        [alt]="item.alt"
                        [preview]="true"
                        appendTo="body"
                        width="100%"
                        imageClass="w-full h-auto object-contain max-h-[350px] md:max-h-[450px] hover:scale-105 transition-transform duration-1000 cursor-zoom-in">

                        <ng-template #indicator>
                            <i class="pi pi-search-plus text-3xl text-white"></i>
                        </ng-template>
                      </p-image>

                    </div>
                  </ng-template>

                  <ng-template #thumbnail let-item>
                    <div class="p-2">
                      <div class="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all duration-300">
                        <img [src]="item.thumbnailImageSrc" class="w-full h-full object-cover" />
                      </div>
                    </div>
                  </ng-template>
                </p-galleria>

                <div class="absolute top-6 left-6" *ngIf="product.resolution_name">
                  <span class="bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg shadow-lg">
                    {{ product.resolution_name }}
                  </span>
                </div>


              </div>

              <div class="grid grid-cols-2 gap-3 items-center">
              <div class="flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100/50 dark:border-slate-800">

                <button (click) = "openFullView(product!)"
                        class="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 group">

                  <i class="pi pi-external-link text-[10px] transition-transform group-hover:scale-110"></i>

                  <span>Click to see full view</span>
                </button>
              </div>
                <div class="flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100/50 dark:border-slate-800">

                  <button
                          (click)="showReviews()" class="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 group">

                    <i class="pi pi-external-link text-[10px] transition-transform group-hover:scale-110"></i>

                    <span>Click to see Reviews</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="flex flex-col py-2">
              <div class="flex justify-between items-center mb-6">
                <span class="text-[9px] font-black tracking-[0.4em] text-blue-600 dark:text-blue-400 uppercase">{{ product.parent_category_name }}</span>
                <div class="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400">
                  <i class="pi pi-star-fill text-amber-400"></i>
                  {{ averageRating }} <span class="mx-1 opacity-20">|</span> {{ totalReviews }} Reviews
                </div>
              </div>

              <div class="font-semibold text-xl mb-4">{{ product.product_base_name }}</div>

              <span class="text-sm font-bold text-slate-400 mb-8 block">{{ product.model }}</span>

              <div class="flex items-center gap-4 mb-8">
                <span class="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {{ product.discounted_price | currency: 'TZS ': 'symbol':'1.0-0' }}
                </span>

                <div class="flex flex-col">
                  <span class="text-sm text-slate-400 line-through font-bold">
                    {{ product.actual_price | currency: 'TZS ': 'symbol':'1.0-0' }}
                  </span>

                  @if (product.discount_percentage > 0) {
                    <span class="text-xs font-extrabold text-red-500 uppercase tracking-wider">
                      Save {{ product.discount_percentage }}%
                    </span>
                  }
                </div>
              </div>

              <div *ngIf="product.supported_internet_services_names.length > 0" class="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/30 mb-8">
                <span class="block text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Supported Services</span>
                <p class="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic">
                  {{ product.supported_internet_services_names }}
                </p>
              </div>

              <div [ngClass]="product.quantity_in_stock > 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'"
                   class="p-4 rounded-xl border flex items-center justify-between mb-10">
                <div class="flex items-center gap-2">
                  <div [ngClass]="product.quantity_in_stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'" class="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  <span class="text-[10px] font-black uppercase tracking-widest" [ngClass]="product.quantity_in_stock > 0 ? 'text-emerald-600' : 'text-rose-600'">
                    {{ product.quantity_in_stock > 0 ? 'Ready to Ship' : 'Out of Stock' }}
                  </span>
                </div>
                <span class="text-[10px] font-bold text-slate-400">{{ product.quantity_in_stock }} units left</span>
              </div>

              <div class="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div class="flex gap-4">
                  <div class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                    <button (click)="quantity = quantity > 1 ? quantity - 1 : 1" class="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      <i class="pi pi-minus text-[10px]"></i>
                    </button>
                    <input type="number" [(ngModel)]="quantity" class="w-8 bg-transparent text-center font-black text-xs outline-none text-slate-900 dark:text-white" readonly>
                    <button (click)="quantity = quantity + 1" class="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      <i class="pi pi-plus text-[10px]"></i>
                    </button>
                  </div>


                  <button (click)="addToCart()"
                          class="flex-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm">
                    <i class="pi pi-shopping-bag"></i> Add to Cart
                  </button>

                  <button *ngIf="isAuthenticated()" class="w-12 h-12 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-all">
                    <i class="pi pi-heart-fill text-xs"></i>
                  </button>
                </div>

                <button
                        (click)="redirectToNotAvailable()"class="w-full h-14 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-blue-500/20 hover:opacity-90 active:scale-[0.98] transition-all">
                  Buy Now
                </button><br>

                <div class="mt-6">
                  <p-fieldset legend="About this item" [toggleable]="true">
                      <p class="m-0">
                          {{ product.description }}
                      </p>
                  </p-fieldset>

                </div>
              </div>
            </div>
            </div>

            <div class="mb-5 mt-8 px-5">
              <p-tabs value="0">
                  <p-tablist>
                      <p-tab value="0">Overview</p-tab>
                      <p-tab value="1">Technical Details</p-tab>
                      <p-tab value="2">Reviews</p-tab>
                  </p-tablist>

                  <p-tabpanels>
                      <p-tabpanel value="0">
                          <p class="m-0 mb-6 text-slate-600 dark:text-slate-400 leading-relaxed">
                              Experience the perfect blend of innovation and performance with the <strong>{{ product.product_base_name }}</strong>.
                              This overview highlights the core technologies and standout features of the {{ product.model }} model,
                              designed to elevate your daily workflow and entertainment.
                          </p>

                          <div class="font-semibold text-xl mb-4">About this item</div>

                          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                              <div class="lg:col-span-4 space-y-6">
                                  <p-accordion [value]="0">
                                      <p-accordion-panel value="0">
                                          <p-accordion-header>Smart Features</p-accordion-header>
                                          <p-accordion-content>
                                              <p class="m-0 text-sm">
                                                  {{ product.smart_features ? 'This smart-enabled device supports:' : 'Standard features included.' }}
                                                  <span class="block mt-2 font-medium text-primary">
                                                      {{ product.supported_internet_services_names || 'Built-in system apps' }}
                                                  </span>
                                              </p>
                                          </p-accordion-content>
                                      </p-accordion-panel>

                                      <p-accordion-panel value="1">
                                          <p-accordion-header>Display & Build</p-accordion-header>
                                          <p-accordion-content>
                                              <p class="m-0 text-sm">
                                                  Equipped with a <strong>{{ product.panel_type_name }}</strong> display at
                                                  <strong>{{ product.resolution_name }}</strong> resolution.
                                                  Certified condition: <span class="text-primary font-bold">{{ product.condition }}</span>.
                                              </p>
                                          </p-accordion-content>
                                      </p-accordion-panel>
                                  </p-accordion>

                                  <div class="p-4 bg-surface-50 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800">
                                      <div class="font-semibold text-sm mb-3">Quick Summary</div>
                                      <ul class="list-none p-0 m-0 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                                          <li class="flex items-center gap-2"><i class="pi pi-check-circle text-green-500"></i> <strong>Brand:</strong> {{ product.brand_name }}</li>
                                          <li class="flex items-center gap-2"><i class="pi pi-check-circle text-green-500"></i> <strong>Model:</strong> {{ product.model }}</li>
                                          <li class="flex items-center gap-2"><i class="pi pi-check-circle text-green-500"></i> <strong>Screen:</strong> {{ product.screen_size_name }}</li>
                                      </ul>
                                  </div>
                              </div>

                              <div class="lg:col-span-8">
                                  <div class="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-700 shadow-lg">
                                      @if (activeVideo || product.videos[0]) {
                                          <video
                                              [src]="activeVideo?.video ?? product.videos[0].video"
                                              controls
                                              class="w-full h-full object-contain">
                                          </video>
                                      } @else {
                                          <div class="flex flex-col items-center justify-center h-full text-surface-400">
                                              <i class="pi pi-video text-5xl mb-3"></i>
                                              <p class="font-medium">No demonstration video available</p>
                                          </div>
                                      }
                                  </div>

                                  <div class="flex gap-3 mt-4 overflow-x-auto pb-2">
                                      @for (v of product.videos; track v.video) {
                                          <div (click)="activeVideo = v"
                                               [class.ring-2]="activeVideo === v"
                                               class="min-w-[140px] aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 ring-primary">
                                              <i class="pi pi-play text-slate-400"></i>
                                              <span class="text-[10px] mt-1 font-bold text-slate-500 uppercase">Clip {{ $index + 1 }}</span>
                                          </div>
                                      }
                                  </div>
                              </div>
                          </div>
                      </p-tabpanel>

                      <p-tabpanel value="1">
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-10 p-4">
                              <div>
                                  <h5 class="mb-4 text-lg font-bold">Hardware Specifications</h5>
                                  <div class="overflow-hidden rounded-lg border border-slate-100 dark:border-slate-800">
                                      <table class="w-full text-sm border-collapse">
                                          <tr class="border-b border-slate-100 dark:border-slate-800">
                                              <td class="py-3 font-bold bg-slate-50 dark:bg-slate-800/50 w-1/3 px-4">SKU</td>
                                              <td class="py-3 px-4">{{ product.sku }}</td>
                                          </tr>
                                          <tr class="border-b border-slate-100 dark:border-slate-800">
                                              <td class="py-3 font-bold bg-slate-50 dark:bg-slate-800/50 px-4">Resolution</td>
                                              <td class="py-3 px-4">{{ product.resolution_name }}</td>
                                          </tr>
                                          @if (product.electrical_specs) {
                                              <tr class="border-b border-slate-100 dark:border-slate-800">
                                                  <td class="py-3 font-bold bg-slate-50 dark:bg-slate-800/50 px-4">Power</td>
                                                  <td class="py-3 px-4">{{ product.electrical_specs.voltage }} ({{ product.electrical_specs.frequency }})</td>
                                              </tr>
                                          }
                                          <tr>
                                              <td class="py-3 font-bold bg-slate-50 dark:bg-slate-800/50 px-4">Color</td>
                                              <td class="py-3 px-4">{{ product.color }}</td>
                                          </tr>
                                      </table>
                                  </div>
                              </div>

                              <div>
                                  <h5 class="mb-4 text-lg font-bold">Connectivity & Ports</h5>
                                  <div class="flex flex-wrap gap-2">
                                      @for (conn of product.connectivity_details; track $index) {
                                          <div class="flex items-center gap-3 px-4 py-2 bg-surface-50 dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-800">
                                              <span class="text-sm font-medium">{{ conn.connectivity_name }}</span>
                                              <span class="bg-primary text-primary-contrast rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                                  {{ conn.connectivity_count }}
                                              </span>
                                          </div>
                                      } @empty {
                                          <p class="text-slate-400 italic">No specific port details available.</p>
                                      }
                                  </div>

                                  <div class="mt-6 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/10 border-l-4 border-primary">
                                      <div class="text-xs font-bold text-primary uppercase mb-1">Supported Services</div>
                                      <p class="text-sm text-primary-900 dark:text-primary-100 m-0">
                                          {{ product.supported_internet_services_names || 'General Internet access' }}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      </p-tabpanel>

                      <p-tabpanel value="2">
                          <div class="p-4 max-w-4xl">
                              <h5 class="mb-6 text-xl font-bold">Customer Feedback</h5>

                              @if (product.user_reviews.length === 0) {
                                  <div class="flex flex-col items-center py-10 text-slate-400">
                                      <i class="pi pi-comments text-4xl mb-2"></i>
                                      <p>Be the first to review this product!</p>
                                  </div>
                              } @else {
                                  @for (review of product.user_reviews; track review.id) {
                                      <div class="mb-8 pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                          <div class="flex items-center gap-3 mb-3">
                                            <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-bold text-primary overflow-hidden border border-slate-200 dark:border-slate-800">
                                                @if (review.profile_picture) {
                                                    <img
                                                        [src]="review.profile_picture"
                                                        [alt]="review.user"
                                                        class="w-full h-full object-cover"
                                                    />
                                                } @else {
                                                    {{ review.user.charAt(0) }}
                                                }
                                              </div>
                                              <div class="flex flex-col">
                                                  <span class="font-bold text-sm">{{ review.user }}</span>
                                                  <span class="text-xs text-slate-400">{{ review.created_at | date:'medium' }}</span>
                                              </div>
                                          </div>

                                          <div class="flex text-orange-400 text-xs mb-3">
                                              @for (star of [1,2,3,4,5]; track $index) {
                                                  <i [class]="star <= review.rating ? 'pi pi-star-fill' : 'pi pi-star'" class="mr-1"></i>
                                              }
                                          </div>

                                          <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed m-0 italic">
                                              "{{ review.comment }}"
                                          </p>
                                      </div>
                                  }
                              }
                          </div>
                      </p-tabpanel>
                  </p-tabpanels>
              </p-tabs>
          </div>

          <div class="text-center mb-5 mt-12 px-5" *ngIf="relatedProducts.length > 0">
              <div class="text-surface-900 dark:text-surface-0 font-normal mb-2 text-4xl">Similar Products</div>
              <span class="text-muted-color text-2xl">Recommended base on the selected Product...</span>
          </div>

          <section class="mt-5 py-10 border-t border-gray-100 dark:border-slate-800" *ngIf="relatedProducts.length > 0">


            <div class="grid grid-cols-12 gap-6">
                <div *ngFor="let item of relatedProducts" class="col-span-12 sm:col-span-6 lg:col-span-3 p-2">
                    <div class="p-4 border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl flex flex-col h-full shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                         [routerLink]="isAuthenticated() ? ['/dashboard/catalog', item.id] : ['/der/product', item.id]">

                        <div class="relative w-full aspect-[4/3] overflow-hidden rounded-lg bg-gray-50 dark:bg-slate-800">
                            <img class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                 [src]="item.thumbnail ? item.thumbnail : 'https://placehold.co/400x300/a5b4fc/4338ca?text=No+Image'"
                                 [alt]="item.parent_product_name" />

                            <div class="absolute top-2 left-2">
                                <p-tag [value]="item.resolution_name" severity="info" class="opacity-90"></p-tag>
                            </div>
                        </div>

                        <div class="flex flex-col flex-1 pt-4">
                            <div class="flex flex-col gap-1 mb-4">
                                <span class="text-[10px] font-bold text-primary uppercase tracking-tighter">{{ item.brand_name }}</span>
                                <div class="font-semibold text-xl mb-4">{{ item.parent_product_name }}</div>
                                <p class="text-sm text-slate-500 line-clamp-1">Model: {{ item.model }}</p>
                            </div>

                            <div class="mt-auto pt-4 border-t border-gray-50 dark:border-slate-800">
                                <div class="flex justify-between items-center">
                                    <div class="flex flex-col">
                                        <span class="text-xs text-slate-400 line-through" *ngIf="item.actual_price !== item.discounted_price">
                                            {{ item.actual_price | currency:'TZS ':'symbol':'1.0-0' }}
                                        </span>
                                        <span class="text-xl font-black text-slate-900 dark:text-white">
                                            {{ item.discounted_price | currency:'TZS ':'symbol':'1.0-0' }}
                                        </span>
                                    </div>
                                    <p-button icon="pi pi-chevron-right" [rounded]="true" severity="primary" [text]="true"></p-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div *ngIf="isRecsLoading" class="grid grid-cols-12 gap-6 mt-10">
            <div *ngFor="let i of [1,2,3,4]" class="col-span-12 sm:col-span-6 lg:col-span-3">
                <p-skeleton width="100%" height="200px" borderRadius="12px"></p-skeleton>
                <p-skeleton width="60%" height="1rem" styleClass="mt-4"></p-skeleton>
                <p-skeleton width="40%" height="1rem" styleClass="mt-2"></p-skeleton>
            </div>
        </div>

      </div>

      <p-dialog *ngIf="product"
          [(visible)]="showMediaDialog"
          [modal]="true"
          [draggable]="false"
          [resizable]="false"
          [showHeader]="true"
          maskStyleClass="backdrop-blur-md bg-slate-900/40"
          styleClass="!w-[95vw] !max-w-[1200px] !rounded-[2.5rem] !overflow-hidden !border-none !shadow-2xl">

  <p-tabs value="0">
    <p-tablist>
      <p-tab value="0" class="uppercase">Images</p-tab>
      <p-tab value="1" class="uppercase">Videos</p-tab>
    </p-tablist>

    <p-tabpanels>
      <p-tabpanel value="0">
        <div *ngIf="product.images && product.images.length > 0; else noImages"
             class="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 bg-white dark:bg-slate-900 transition-colors duration-300">

          <div class="lg:col-span-9 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] overflow-hidden flex items-center justify-center min-h-[350px] md:min-h-[550px] border border-slate-100 dark:border-slate-800 shadow-inner">
            <p-image
                [src]="selectedGalleryImage ?? product.images[0].image"
                [alt]="product.parent_product_name"
                [preview]="true"
                appendTo="body"
                imageClass="max-w-[90%] max-h-[500px] object-contain transition-all duration-700 hover:scale-105 cursor-zoom-in">
            </p-image>
          </div>

          <div class="lg:col-span-3 flex flex-col">
            <h3 class="text-[9px] font-black uppercase text-slate-400 mb-4 tracking-[0.2em] px-1">
              Gallery ({{ product.images.length }})
            </h3>
            <div class="grid grid-cols-4 lg:grid-cols-2 gap-3 overflow-y-auto lg:max-h-[500px] pr-2 scrollbar-hide">
              <div *ngFor="let img of product.images"
                   (click)="selectedGalleryImage = img.image"
                   [ngClass]="(selectedGalleryImage === img.image || (!selectedGalleryImage && product.images[0] === img)) ? 'ring-2 ring-blue-600 scale-95 shadow-lg' : 'opacity-70 hover:opacity-100'"
                   class="aspect-square rounded-2xl bg-white dark:bg-slate-800 p-1 cursor-pointer transition-all duration-300 border border-slate-100 dark:border-slate-700 overflow-hidden">
                <img [src]="img.image" class="w-full h-full object-cover rounded-xl">
              </div>
            </div>
          </div>
        </div>

        <ng-template #noImages>
          <div class="flex flex-col items-center justify-center py-24 text-center">
            <div class="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <i class="pi pi-image text-slate-300 dark:text-slate-600 text-4xl"></i>
            </div>
            <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">No Images Available</h3>
            <p class="text-slate-500 max-w-xs">We haven't uploaded images for this product yet. Check back soon!</p>
          </div>
        </ng-template>
      </p-tabpanel>

      <p-tabpanel value="1">
        <div *ngIf="product?.videos && product.videos.length > 0; else noVideos"
             class="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 bg-white dark:bg-slate-900 transition-colors duration-300">

          <div class="lg:col-span-8 bg-black rounded-[2rem] overflow-hidden aspect-video flex items-center justify-center shadow-2xl border border-slate-800">
            <video #videoPlayer
                   [src]="activeVideo?.video ?? product.videos[0].video"
                   controls
                   class="w-full h-full">
            </video>
          </div>

          <div class="lg:col-span-4 flex flex-col">
            <h3 class="text-[9px] font-black uppercase text-slate-400 mb-4 tracking-[0.2em] px-1">Available Videos</h3>
            <div class="flex flex-col gap-3 overflow-y-auto lg:max-h-[450px] pr-2 scrollbar-thin">
              <div *ngFor="let video of product?.videos"
                   (click)="activeVideo = video"
                   class="flex gap-4 p-3 rounded-2xl cursor-pointer transition-all border border-transparent group"
                   [ngClass]="(activeVideo?.id === video.id || (!activeVideo && product.videos[0] === video)) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/40 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-slate-800'">

                <div class="relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <i class="pi pi-video text-slate-400 text-xl group-hover:scale-110 transition-transform"></i>
                  <div class="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/0 transition-colors">
                    <i class="pi pi-play-circle text-white text-xl shadow-xl"></i>
                  </div>
                </div>

                <div class="flex flex-col justify-center gap-1">
                  <span class="text-[11px] font-black text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                    Video #{{ video.id }}
                  </span>
                  <span class="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">Click to play</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ng-template #noVideos>
          <div class="flex flex-col items-center justify-center py-24 text-center">
            <div class="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <i class="pi pi-video text-slate-300 dark:text-slate-600 text-4xl"></i>
            </div>
            <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">No Videos Found</h3>
            <p class="text-slate-500 max-w-xs">There are currently no video demonstrations available for this appliance.</p>
          </div>
        </ng-template>
      </p-tabpanel>
    </p-tabpanels>
  </p-tabs>
</p-dialog>

<p-dialog *ngIf="product"
  header="Customer Feedback"
  [(visible)]="displayReviews"
  [modal]="true"
  [breakpoints]="{ '960px': '75vw', '641px': '90vw' }"
  [style]="{ width: '50vw' }"
  [draggable]="false"
  [resizable]="false"
  styleClass="dark:bg-slate-900"
  maskStyleClass="backdrop-blur-sm">

  <div class="p-4 max-w-4xl">
    @if (product.user_reviews.length === 0) {
        <div class="flex flex-col items-center py-10 text-slate-400">
            <i class="pi pi-comments text-4xl mb-2"></i>
            <p>Be the first to review this product!</p>
        </div>
    } @else {
        @for (review of product.user_reviews; track review.id) {
            <div class="mb-8 pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-bold text-primary overflow-hidden border border-slate-200 dark:border-slate-800">
                      @if (review.profile_picture) {
                          <img [src]="review.profile_picture" [alt]="review.user" class="w-full h-full object-cover" />
                      } @else {
                          {{ review.user.charAt(0) }}
                      }
                    </div>
                    <div class="flex flex-col">
                        <span class="font-bold text-sm">{{ review.user }}</span>
                        <span class="text-xs text-slate-400">{{ review.created_at | date:'medium' }}</span>
                    </div>
                </div>

                <div class="flex text-orange-400 text-xs mb-3">
                    @for (star of [1,2,3,4,5]; track $index) {
                        <i [class]="star <= review.rating ? 'pi pi-star-fill' : 'pi pi-star'" class="mr-1"></i>
                    }
                </div>

                <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed m-0 italic">
                    "{{ review.comment }}"
                </p>
            </div>
        }
    }
  </div>
</p-dialog>


    `,

})
export class Specific implements OnInit, AfterViewInit, OnDestroy {

  product: IProductSpecification | undefined;
  relatedProducts: IProductRecommendation[] = [];
  isRecsLoading: boolean = false;
  isLoading = true;
  displayReviews: boolean = false;
  error: string | null = null;
  private routeSub: Subscription | undefined;

  showMediaDialog: boolean = false;
  isAuthenticated = signal<boolean>(false);

  selectedGalleryImage: string | undefined;
  activeVideo: any | undefined;

  quantity: number = 1;
  selectedSize: string = 'M';

  galleriaImages: any[] = [];
  galleriaResponsiveOptions: any[] = [
    { breakpoint: '1024px', numVisible: 5 },
    { breakpoint: '768px', numVisible: 3 },
    { breakpoint: '560px', numVisible: 1 }
  ];

  private driftZoom: any;
  private gallery: any;
  mainImageUrl: string = '';
  selectedColor: string = '';
  public Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: Auth,
    private productService: Master,
    private cartService: Cart,
    private notify: Message
  ) { }

  ngOnInit(): void {

    this.ckeckUserAuthStatus()

    this.routeSub = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.isLoading = true;

          window.scrollTo({ top: 0, behavior: 'smooth' });
          return this.productService.getProductById(id);
        }
        return EMPTY;
      })
    ).subscribe({
      next: (data: IProductSpecification) => {
        this.product = data;
        this.isLoading = false;

        if (this.product.id) {
          this.loadRecommendations(this.product.id);
        }

        if (this.product.images && this.product.images.length > 0) {
          this.galleriaImages = this.product.images.map(img => ({
            itemImageSrc: img.image,
            thumbnailImageSrc: img.image,
            alt: this.product?.parent_product_name
          }));
          this.mainImageUrl = this.product.images[0].image;
        } else {
          this.galleriaImages = [];
          this.mainImageUrl = '';
        }

        this.selectedColor = this.product.color || '';

        this.setupImageLibraries();

        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 800, once: true });
          AOS.refresh();
        }
      },
      error: (err) => {
        this.notify.error('Product not found.', 'Error');
        this.isLoading = false;
      }
    });
  }

  ckeckUserAuthStatus(){

    if(this.authService.getAuthenticatedUser()){
      return this.isAuthenticated.set(true);
    }

    return this.isAuthenticated.set(false);

  }


  loadRecommendations(id: number) {
    this.isRecsLoading = true;

    this.productService.getSimilarProducts(id).subscribe({
      next: (recData: IProductRecommendation[]) => {
        this.relatedProducts = recData;
        this.isRecsLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load recommendations:', err);
        this.relatedProducts = [];
        this.isRecsLoading = false;
      }
    });
  }

  get totalReviews(): number {
    return this.product?.user_reviews?.length || 0;
  }

  get averageRating(): number {
    if (!this.product || !this.product.user_reviews || this.product.user_reviews.length === 0) {
      return 0;
    }
    const sum = this.product.user_reviews.reduce((acc, review) => acc + review.rating, 0);
    return parseFloat((sum / this.product.user_reviews.length).toFixed(1));
  }

  addToCart(): void {
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

  ngAfterViewInit(): void {
    if (this.product) { this.setupImageLibraries(); }
    if (typeof AOS !== 'undefined') { AOS.refresh(); }
  }

  setupImageLibraries(): void {
    if (this.driftZoom) { this.driftZoom.destroy(); }
    const mainImageElement = document.getElementById('main-product-image');
    if (mainImageElement) {
      this.driftZoom = new Drift(mainImageElement, {
        paneContainer: mainImageElement.parentElement,
        inlinePane: 900,
        zoomFactor: 3
      });
    }

    if (this.gallery) { this.gallery.destroy(); }
    this.gallery = GLightbox({
      selector: '.glightbox-item',
      touchNavigation: true,
      loop: true
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
    if (this.driftZoom) this.driftZoom.destroy();
    if (this.gallery) this.gallery.destroy();
  }



  openFullView(product: IProductSpecification) {

      if (!product) return;

      if (product.images && product.images.length > 0) {
        this.selectedGalleryImage = product.images[0].image;
      }

      if (product.videos && product.videos.length > 0) {
        this.activeVideo = product.videos[0];
      }

      this.showMediaDialog = true;
    }

    showReviews() {
      this.displayReviews = true;
    }

    redirectToNotAvailable(){
      return this.router.navigate(['/notavailable']);
    }

}
