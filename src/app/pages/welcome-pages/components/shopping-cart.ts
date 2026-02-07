import { Component, OnInit, HostListener, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { Cart } from '../../../shared/services/cart';
import { CartItem } from '../../../shared/interfaces/cart';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { Master } from '../../../shared/services/master';
import { Auth } from '../../../shared/services/auth';
import { IProductRecommendation } from '../../../shared/interfaces/product';

@Component({
    selector: 'app-shopping-cart',
    imports: [CommonModule, FormsModule, ConfirmDialogModule, ToastModule, CarouselModule, ButtonModule],
    template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

        <div class="card" *ngIf="isAuthenticated()">

              <div class="flex flex-col lg:flex-row gap-8 lg:gap-12">

                <div class="w-full lg:w-2/3">
                  <div class="flex items-center justify-between mb-6 md:mb-10">
                    <div class="font-semibold text-xl mb-4">Shopping Cart</div>
                    <span class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-1 px-3 rounded-full text-[10px] font-bold uppercase tracking-widest" *ngIf="(cartItems$ | async) as items">
                      {{ items.length }} Items
                    </span>
                  </div>

                  <div class="hidden md:flex justify-between text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-4 mb-2 font-bold text-[10px] uppercase tracking-widest">
                    <span class="flex-[2.5]">Product Details</span>
                    <span class="flex-1 text-center">Price</span>
                    <span class="flex-1 text-center">Quantity</span>
                    <span class="flex-1 text-right">Subtotal</span>
                  </div>

                  <div *ngIf="(cartItems$ | async) as cartItems">

                    <div *ngIf="cartItems.length === 0" class="mt-8 mb-3 p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-surface-50 dark:bg-surface-900/50 text-center">
                        <div class="flex flex-col items-center gap-4 max-w-xl mx-auto">
                            <div class="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-2">
                                <i class="pi pi-shopping-bag  text-primary-600 text-2xl"></i>
                            </div>

                            <h3 class="text-xl font-bold text-slate-900 dark:text-white">
                                Your Cart is Empty
                            </h3>
                            <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Your cart is currently empty. Explore our curated selection of electronics and components to get back to what you do best.
                            </p>

                            <div class="flex flex-col sm:flex-row gap-3 mt-4 w-full sm:w-auto">
                                <p-button
                                  label="Start Sopping"
                                  (click)="startShopping()"
                                  styleClass="p-button-outlined px-8">
                                </p-button>
                            </div>

                        </div>
                    </div>

                    <div *ngFor="let item of cartItems" class="group flex flex-col md:flex-row py-6 border-b border-slate-50 dark:border-slate-800 items-center transition-colors rounded-xl px-2">

                      <div class="flex-[2.5] flex items-center w-full gap-4 md:gap-6">
                        <div class="relative flex-shrink-0 overflow-hidden rounded-xl shadow-sm bg-white dark:bg-slate-800">
                          <img [src]="item.product.images[0].image || 'placeholder.jpg'" class="w-20 h-20 md:w-24 md:h-24 object-cover">
                        </div>
                        <div class="flex-1 min-w-0">
                          <span class="text-[9px] font-black uppercase tracking-tighter text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded" *ngIf="item.product.brand_name">{{ item.product.brand_name }}</span>
                          <h5 class="text-sm md:text-base font-bold leading-tight mt-1 mb-1 truncate">{{ item.product.parent_product_name }}</h5>
                          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                            {{ item.product.model }} <span *ngIf="item.product.screen_size_name" class="mx-1">| {{ item.product.screen_size_name }} &nbsp;&nbsp;inch</span>
                          </p>
                          <button class="mt-2 text-slate-400 hover:text-red-500 text-[10px] font-bold flex items-center gap-1 transition-colors" (click)="confirmRemove(item.id)">
                            <i class="pi pi-trash"></i> REMOVE
                          </button>
                        </div>
                      </div>

                      <div class="flex md:flex-1 w-full justify-between md:justify-center items-center mt-4 md:mt-0 px-2 md:px-0">
                        <span class="text-slate-400 text-[10px] md:hidden uppercase font-bold">Price</span>
                        <span class="font-bold text-sm md:text-base">{{ item.product.discounted_price | currency: 'TZS ': 'symbol':'1.0-0' }}</span>
                      </div>

                      <div class="flex md:flex-1 w-full justify-between md:justify-center items-center mt-2 md:mt-0 px-2 md:px-0">
                         <span class="text-slate-400 text-[10px] md:hidden uppercase font-bold">Qty</span>
                         <div class="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                           <input type="number" [value]="item.quantity" min="1" class="w-10 md:w-12 py-1 text-center text-xs font-bold bg-transparent outline-none" (change)="updateQuantity(item.id, $event)">
                         </div>
                      </div>

                      <div class="flex md:flex-1 w-full justify-between md:justify-end items-center mt-2 md:mt-0 px-2 md:px-0">
                        <span class="text-slate-400 text-[10px] md:hidden uppercase font-bold">Total</span>
                        <span class="font-black text-base md:text-lg tracking-tight">{{ getItemSubtotal(item) | currency: 'TZS ': 'symbol':'1.0-0' }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="w-full lg:w-1/3">
                  <div class="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-xl lg:shadow-2xl border border-slate-50 dark:border-slate-800 sticky top-8">
                    <div class="font-semibold text-xl mb-4">Order Summary</div>

                    <div class="space-y-4 mb-6">
                      <div class="flex justify-between text-sm text-slate-500">
                        <span>Subtotal</span>
                        <span class="text-slate-900 dark:text-slate-100 font-bold">{{ cartService.subtotal$ | async | currency: 'TZS ': 'symbol':'1.0-0' }}</span>
                      </div>

                      <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                         <div class="flex justify-between mb-4">
                           <span class="font-bold text-xs uppercase tracking-widest">Shipping</span>
                           <span [ngClass]="{'text-green-600': (cartService.shippingCost$ | async) === 0}" class="font-black text-xs uppercase">
                             {{ (cartService.shippingCost$ | async) === 0 ? 'FREE' : (cartService.shippingCost$ | async | currency: 'TZS ': 'symbol':'1.0-0') }}
                           </span>
                         </div>
                         <div class="space-y-2">
                           <div *ngFor="let method of (cartService.shippingMethods$ | async)" class="flex items-center gap-3">
                              <input type="radio" [id]="'ship-'+method.id" name="ship" [checked]="(cartService.selectedMethodId$ | async) === method.id" (change)="cartService.setSelectedMethod(method.id)" class="accent-slate-900 dark:accent-slate-100">
                              <label [for]="'ship-'+method.id" class="text-[11px] font-medium cursor-pointer">{{ method.name }}</label>
                           </div>
                         </div>
                      </div>
                    </div>

                    <div class="flex justify-between items-center mb-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                      <span class="text-slate-400 font-bold uppercase tracking-widest text-[10px] leading-none">
                        Total
                      </span>

                      <h4 class="text-2xl md:text-3xl font-black tracking-tighter text-blue-600 dark:text-blue-400 m-0 leading-none">
                        {{ cartService.total$ | async | currency: 'TZS ': 'symbol':'1.0-0' }}
                      </h4>
                    </div>

                    <button (click)="redirectToNotAvailable()"
                      class="hidden lg:flex items-center justify-center w-full py-4 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white text-sm font-black rounded-2xl hover:bg-black dark:hover:bg-white hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200 dark:hover:shadow-none transition-all duration-300 uppercase tracking-widest active:scale-95 group mb-6">
                      Checkout Now
                      <i class="pi pi-arrow-right ml-2 text-xs transition-transform group-hover:translate-x-1"></i>
                    </button>

                  <div class="flex justify-center lg:justify-center mt-4">
                    <button (click)="startShopping()" *ngIf="(cartItems$ | async)?.length"
                            class="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 group">
                      <i class="pi pi-arrow-left text-[10px] transition-transform group-hover:-translate-x-2"></i>
                      Continue Shopping
                    </button>
                  </div>
                  </div>
                </div>
              </div>

              <div class="mt-10 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div class="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div class="flex w-full md:max-w-sm rounded-full overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1">
                    <input type="text" class="flex-1 px-5 py-2 outline-none text-sm bg-transparent" placeholder="Enter coupon code">
                    <button class="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white px-6 py-2 rounded-full font-bold text-sm hover:opacity-90 transition-colors">
                      Apply
                    </button>
                  </div>

                  <button *ngIf="(cartItems$ | async)?.length" class="w-full md:w-auto px-8 py-3 border border-slate-200 dark:border-slate-700 rounded-full font-bold text-sm text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
                    Update Cart
                  </button>
                  <button *ngIf="(cartItems$ | async)?.length"
                          (click)="openClearCartConfirmation()"
                          class="px-5 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/50 flex items-center gap-2">
                    <i class="pi pi-trash"></i>
                    Clear Cart
                  </button>
                </div>
              </div>

              <div class="mt-10 md:mt-12 mb-6" *ngIf="((recommendedProducts$ | async) ?? []).length >= 1">
                <div class="flex flex-col gap-6 mb-2 md:mb-4">
                  <div class="h-[1px] w-full bg-slate-100 dark:bg-slate-800"></div>
                  <div class="font-semibold text-xl mb-4">More You May Love</div>
                </div>

                <p-carousel
                  [value]="(recommendedProducts$ | async) || []"
                  [numVisible]="3"
                  [numScroll]="1"
                  [circular]="false"
                  [responsiveOptions]="carouselResponsiveOptions"
                  styleClass="recommendations-carousel custom-carousel">

                  <ng-template let-product #item>
                    <div (click)="goToProduct(product.id)"
                         class="group bg-white dark:bg-slate-900 rounded-[2rem] m-2 md:m-3 p-5 md:p-6 cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] transition-all duration-500 ease-out">

                      <div class="relative mb-5 overflow-hidden rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center h-40 md:h-48">
                        <img [src]="product.thumbnail || 'assets/placeholder-tv.png'"
                             [alt]="product.model"
                             class="h-32 md:h-40 object-contain group-hover:scale-105 transition-transform duration-700" />

                      </div>

                      <div class="text-[9px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest mb-1">
                        {{ product.brand_name }}
                      </div>

                      <h4 class="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base line-clamp-1 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {{ product.parent_product_name }}
                      </h4>

                          <div class="flex items-end justify-between mt-4 md:mt-6">
                            <div class="flex flex-col">
                              <span class="text-[10px] text-slate-400 dark:text-slate-500 line-through font-bold mb-0.5"
                                    *ngIf="product.actual_price !== product.discounted_price">
                                {{ product.actual_price | currency: 'TZS ':'symbol':'1.0-0' }}
                              </span>
                              <span class="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {{ product.discounted_price | currency: 'TZS ':'symbol':'1.0-0' }}
                              </span>
                            </div>

                            <div *ngIf="product.screen_size_name" class="pb-1">
                              <span class="text-[9px] bg-slate-100 dark:bg-slate-800 font-black text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md uppercase tracking-tighter border border-slate-200/50 dark:border-slate-700/50">
                                {{ product.screen_size_name }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </ng-template>
                    </p-carousel>
                </div>

              </div>

                <div class="lg:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 z-50 shadow-[0_-8px_20px_rgba(0,0,0,0.05)] transition-transform duration-300"
                   [ngClass]="{'translate-y-0': isFooterVisible, 'translate-y-full': !isFooterVisible}">
                    <div class="flex items-center justify-between gap-4">
                      <div class="flex flex-col">
                        <span class="text-[9px] uppercase font-black text-slate-400 tracking-widest">Total Amount</span>
                        <span class="text-lg font-black leading-none">
                          {{ cartService.total$ | async | currency: 'TZS ': 'symbol':'1.0-0' }}
                        </span>
                      </div>
                      <button (click)="redirectToNotAvailable()" class="flex-1 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[11px]">
                        Checkout
                      </button>
                    </div>

        </div>

        <div *ngIf="!isAuthenticated()">

        <div class="container mx-auto my-6 md:my-12 px-4 sm:px-6 lg:px-8 max-w-7xl font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">

          <div class="flex flex-col lg:flex-row gap-8 lg:gap-12">

            <div class="w-full lg:w-2/3">
              <div class="flex items-center justify-between mb-6 md:mb-10">
                <div class="font-semibold text-xl mb-4">Shopping Cart</div>
                <span class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-1 px-3 rounded-full text-[10px] font-bold uppercase tracking-widest" *ngIf="(cartItems$ | async) as items">
                  {{ items.length }} Items
                </span>
              </div>

              <div class="hidden md:flex justify-between text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-4 mb-2 font-bold text-[10px] uppercase tracking-widest">
                <span class="flex-[2.5]">Product Details</span>
                <span class="flex-1 text-center">Price</span>
                <span class="flex-1 text-center">Quantity</span>
                <span class="flex-1 text-right">Subtotal</span>
              </div>

              <div *ngIf="(cartItems$ | async) as cartItems">
                <div *ngIf="cartItems.length === 0" class="mt-8 mb-3 p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-surface-50 dark:bg-surface-900/50 text-center">
                    <div class="flex flex-col items-center gap-4 max-w-xl mx-auto">
                        <div class="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-2">
                            <i class="pi pi-shopping-bag  text-primary-600 text-2xl"></i>
                        </div>

                        <h3 class="text-xl font-bold text-slate-900 dark:text-white">
                            Your Cart is Empty
                        </h3>
                        <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Sign in to your account to unlock personalized recommendations and explore our full range of products specifically chosen for you.
                        </p>

                        <div class="flex flex-col sm:flex-row gap-3 mt-4 w-full sm:w-auto">
                            <p-button
                                label="Sign In"
                                (click)="signIn()"
                                styleClass="p-button-primary px-8">
                            </p-button>
                            <p-button
                              label="Start Sopping"
                              (click)="startShopping()"
                              styleClass="p-button-outlined px-8">
                            </p-button>
                        </div>

                    </div>
                </div>

                <div *ngFor="let item of cartItems" class="group flex flex-col md:flex-row py-6 border-b border-slate-50 dark:border-slate-800 items-center transition-colors rounded-xl px-2">

                  <div class="flex-[2.5] flex items-center w-full gap-4 md:gap-6">
                    <div class="relative flex-shrink-0 overflow-hidden rounded-xl shadow-sm bg-white dark:bg-slate-800">
                      <img [src]="item.product.images[0].image || 'placeholder.jpg'" class="w-20 h-20 md:w-24 md:h-24 object-cover">
                    </div>
                    <div class="flex-1 min-w-0">
                      <span class="text-[9px] font-black uppercase tracking-tighter text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded" *ngIf="item.product.brand_name">{{ item.product.brand_name }}</span>
                      <h5 class="text-sm md:text-base font-bold leading-tight mt-1 mb-1 truncate">{{ item.product.parent_product_name }}</h5>
                      <p class="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                        {{ item.product.model }} <span *ngIf="item.product.screen_size_name" class="mx-1">| {{ item.product.screen_size_name }} &nbsp;&nbsp;inch</span>
                      </p>
                      <button class="mt-2 text-slate-400 hover:text-red-500 text-[10px] font-bold flex items-center gap-1 transition-colors" (click)="confirmRemove(item.id)">
                        <i class="pi pi-trash"></i> REMOVE
                      </button>
                    </div>
                  </div>

                  <div class="flex md:flex-1 w-full justify-between md:justify-center items-center mt-4 md:mt-0 px-2 md:px-0">
                    <span class="text-slate-400 text-[10px] md:hidden uppercase font-bold">Price</span>
                    <span class="font-bold text-sm md:text-base">{{ item.product.discounted_price | currency: 'TZS ': 'symbol':'1.0-0' }}</span>
                  </div>

                  <div class="flex md:flex-1 w-full justify-between md:justify-center items-center mt-2 md:mt-0 px-2 md:px-0">
                     <span class="text-slate-400 text-[10px] md:hidden uppercase font-bold">Qty</span>
                     <div class="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                       <input type="number" [value]="item.quantity" min="1" class="w-10 md:w-12 py-1 text-center text-xs font-bold bg-transparent outline-none" (change)="updateQuantity(item.id, $event)">
                     </div>
                  </div>

                  <div class="flex md:flex-1 w-full justify-between md:justify-end items-center mt-2 md:mt-0 px-2 md:px-0">
                    <span class="text-slate-400 text-[10px] md:hidden uppercase font-bold">Total</span>
                    <span class="font-black text-base md:text-lg tracking-tight">{{ getItemSubtotal(item) | currency: 'TZS ': 'symbol':'1.0-0' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="w-full lg:w-1/3">
              <div class="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-xl lg:shadow-2xl border border-slate-50 dark:border-slate-800 sticky top-8">
                <div class="font-semibold text-xl mb-4">Order Summary</div>

                <div class="space-y-4 mb-6">
                  <div class="flex justify-between text-sm text-slate-500">
                    <span>Subtotal</span>
                    <span class="text-slate-900 dark:text-slate-100 font-bold">{{ cartService.subtotal$ | async | currency: 'TZS ': 'symbol':'1.0-0' }}</span>
                  </div>

                  <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                     <div class="flex justify-between mb-4">
                       <span class="font-bold text-xs uppercase tracking-widest">Shipping</span>
                       <span [ngClass]="{'text-green-600': (cartService.shippingCost$ | async) === 0}" class="font-black text-xs uppercase">
                         {{ (cartService.shippingCost$ | async) === 0 ? 'FREE' : (cartService.shippingCost$ | async | currency: 'TZS ': 'symbol':'1.0-0') }}
                       </span>
                     </div>
                     <div class="space-y-2">
                       <div *ngFor="let method of (cartService.shippingMethods$ | async)" class="flex items-center gap-3">
                          <input type="radio" [id]="'ship-'+method.id" name="ship" [checked]="(cartService.selectedMethodId$ | async) === method.id" (change)="cartService.setSelectedMethod(method.id)" class="accent-slate-900 dark:accent-slate-100">
                          <label [for]="'ship-'+method.id" class="text-[11px] font-medium cursor-pointer">{{ method.name }}</label>
                       </div>
                     </div>
                  </div>
                </div>

                <div class="flex justify-between items-center mb-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <span class="text-slate-400 font-bold uppercase tracking-widest text-[10px] leading-none">
                    Total
                  </span>

                  <h4 class="text-2xl md:text-3xl font-black tracking-tighter text-blue-600 dark:text-blue-400 m-0 leading-none">
                    {{ cartService.total$ | async | currency: 'TZS ': 'symbol':'1.0-0' }}
                  </h4>
                </div>

                <button (click)="redirectToNotAvailable()"
                  class="hidden lg:flex items-center justify-center w-full py-4 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white text-sm font-black rounded-2xl hover:bg-black dark:hover:bg-white hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200 dark:hover:shadow-none transition-all duration-300 uppercase tracking-widest active:scale-95 group mb-6">
                  Checkout Now
                  <i class="pi pi-arrow-right ml-2 text-xs transition-transform group-hover:translate-x-1"></i>
                </button>

              <div class="flex justify-center lg:justify-center mt-4">
                <button (click)="startShopping()" *ngIf="(cartItems$ | async)?.length"
                        class="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 group">
                  <i class="pi pi-arrow-left text-[10px] transition-transform group-hover:-translate-x-2"></i>
                  Continue Shopping
                </button>
              </div>
              </div>
            </div>
          </div>

          <div class="mt-10 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
            <div class="flex flex-col md:flex-row justify-between items-center gap-6">
              <div class="flex w-full md:max-w-sm rounded-full overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1">
                <input type="text" class="flex-1 px-5 py-2 outline-none text-sm bg-transparent" placeholder="Enter coupon code">
                <button class="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white px-6 py-2 rounded-full font-bold text-sm hover:opacity-90 transition-colors">
                  Apply
                </button>
              </div>

              <button *ngIf="(cartItems$ | async)?.length" class="w-full md:w-auto px-8 py-3 border border-slate-200 dark:border-slate-700 rounded-full font-bold text-sm text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
                Update Cart
              </button>
              <button *ngIf="(cartItems$ | async)?.length"
                      (click)="openClearCartConfirmation()"
                      class="px-5 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/50 flex items-center gap-2">
                <i class="pi pi-trash"></i>
                Clear Cart
              </button>
            </div>
          </div>

          <div class="mt-10 md:mt-12 mb-6" *ngIf="((recommendedProducts$ | async) ?? []).length >= 1">
            <div class="flex flex-col gap-6 mb-2 md:mb-4">
              <div class="h-[1px] w-full bg-slate-100 dark:bg-slate-800"></div>
              <div class="font-semibold text-xl mb-4">More You May Love</div>
            </div>

            <p-carousel
              [value]="(recommendedProducts$ | async) || []"
              [numVisible]="3"
              [numScroll]="1"
              [circular]="false"
              [responsiveOptions]="carouselResponsiveOptions"
              styleClass="recommendations-carousel custom-carousel">

              <ng-template let-product #item>
                <div (click)="goToProduct(product.id)"
                     class="group bg-white dark:bg-slate-900 rounded-[2rem] m-2 md:m-3 p-5 md:p-6 cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] transition-all duration-500 ease-out">

                  <div class="relative mb-5 overflow-hidden rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center h-40 md:h-48">
                    <img [src]="product.thumbnail || 'assets/placeholder-tv.png'"
                         [alt]="product.model"
                         class="h-32 md:h-40 object-contain group-hover:scale-105 transition-transform duration-700" />

                  </div>

                  <div class="text-[9px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest mb-1">
                    {{ product.brand_name }}
                  </div>

                  <h4 class="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base line-clamp-1 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {{ product.parent_product_name }}
                  </h4>

                      <div class="flex items-end justify-between mt-4 md:mt-6">
                        <div class="flex flex-col">
                          <span class="text-[10px] text-slate-400 dark:text-slate-500 line-through font-bold mb-0.5"
                                *ngIf="product.actual_price !== product.discounted_price">
                            {{ product.actual_price | currency: 'TZS ':'symbol':'1.0-0' }}
                          </span>
                          <span class="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {{ product.discounted_price | currency: 'TZS ':'symbol':'1.0-0' }}
                          </span>
                        </div>

                        <div *ngIf="product.screen_size_name" class="pb-1">
                          <span class="text-[9px] bg-slate-100 dark:bg-slate-800 font-black text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md uppercase tracking-tighter border border-slate-200/50 dark:border-slate-700/50">
                            {{ product.screen_size_name }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </ng-template>
                </p-carousel>
            </div>

          </div>

            <div class="lg:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 z-50 shadow-[0_-8px_20px_rgba(0,0,0,0.05)] transition-transform duration-300"
               [ngClass]="{'translate-y-0': isFooterVisible, 'translate-y-full': !isFooterVisible}">
                <div class="flex items-center justify-between gap-4">
                  <div class="flex flex-col">
                    <span class="text-[9px] uppercase font-black text-slate-400 tracking-widest">Total Amount</span>
                    <span class="text-lg font-black leading-none">
                      {{ cartService.total$ | async | currency: 'TZS ': 'symbol':'1.0-0' }}
                    </span>
                  </div>
                  <button class="flex-1 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[11px]" (click)="redirectToNotAvailable()">
                    Checkout
                  </button>
                </div>
          </div>

        </div>



    `,
    providers: [ConfirmationService, MessageService]
})
export class ShoppingCart implements OnInit {

  cartItems$: Observable<CartItem[]>;
  public parseFloat = parseFloat;
  recommendedProducts$!: Observable<IProductRecommendation[]>;
  isFooterVisible = true;
  lastScrollTop = 0;
  isAuthenticated = signal<boolean>(false);

  carouselResponsiveOptions = [
    { breakpoint: '1200px', numVisible: 3, numScroll: 1 },
    { breakpoint: '1024px', numVisible: 2, numScroll: 1 },
    { breakpoint: '640px', numVisible: 1, numScroll: 1 } ,
    { breakpoint: '560px', numVisible: 1, numScroll: 1 }
  ];


  constructor(
    public cartService: Cart,
    private router: Router,
    private authService: Auth,
    public masterService: Master,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.cartItems$ = this.cartService.cartItems$;

    this.recommendedProducts$ = this.cartService.cartItems$.pipe(

      map(items => items.map(item => item.product.id).join(',')),
      distinctUntilChanged(),
      switchMap(ids => {

        const idArray = ids ? ids.split(',') : [];
        return this.masterService.getMoreYouMayLove(idArray);
      })
    );

  }

  ngOnInit(): void {

    this.checkUserAuthStatus()

  }

  checkUserAuthStatus(){

    if(this.authService.getAuthenticatedUser()){
      return this.isAuthenticated.set(true);
    }

    return this.isAuthenticated.set(false);

  }


  @HostListener('window:scroll', [])
    onWindowScroll() {
      const st = window.pageYOffset || document.documentElement.scrollTop;

      if (Math.abs(this.lastScrollTop - st) <= 5) return;

      if (st > this.lastScrollTop && st > 100) {
        this.isFooterVisible = false;
      } else {
        this.isFooterVisible = true;
      }
      this.lastScrollTop = st <= 0 ? 0 : st;
  }

  getItemSubtotal(item: CartItem): number {
    const price = parseFloat(item.product.discounted_price);
    if (isNaN(price)) {
      console.warn(`Invalid price string for product ID ${item.product.id}`);
      return 0;
    }
    return price * item.quantity;
  }

  updateQuantity(itemId: number, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const newQuantity = parseInt(inputElement.value, 10);
    this.cartService.updateQuantity(itemId, newQuantity);
  }


  confirmRemove(itemId: number): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to remove this item from your shopping cart?',
      header: 'Confirm Removal',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.removeItem(itemId);
        this.messageService.add({ severity: 'info', summary: 'Removed', detail: 'Item removed from cart' });
      }
    });
  }

  openClearCartConfirmation(): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to remove ALL items from your shopping cart? This action cannot be undone.',
      header: 'Confirm Clear Cart',
      icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.clearCart();
        this.messageService.add({ severity: 'success', summary: 'Cart Cleared', detail: 'All items removed' });
      }
    });
  }



  clearCart(): void {
    this.cartService.clearAllItems();
  }

  removeItem(itemId: number): void {
    this.cartService.removeItem(itemId);
  }


  goToProduct(id: number | string) {
      if(this.isAuthenticated()){
        this.router.navigate(['/dashboard/catalog', id]);
      }else{
        this.router.navigate(['/der/product', id]);
      }
  }

  startShopping() {
    if(this.isAuthenticated()){
      this.router.navigate(['/dashboard/catalog']);
    }else{
      this.router.navigate(['']);
    }
  }

  signIn() {
      this.router.navigate(['/account/login']);
  }

  redirectToNotAvailable(){
    return this.router.navigate(['/notavailable']);
  }



}
