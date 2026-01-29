import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Cart } from '../../../shared/services/cart';
import { ShoppingCart } from '../../../shared/interfaces/cart';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputNumberModule,
    ToastModule,
    CardModule,
    DividerModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="container mx-auto p-4 lg:p-8" *ngIf="cart$ | async as cart">
      <h1 class="text-3xl font-bold mb-6 text-gray-800">Shopping Cart</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div class="lg:col-span-2 space-y-4">
          <p-card *ngFor="let item of cart.items" styleClass="shadow-sm border-round-xl">
            <div class="flex flex-col sm:flex-row items-center gap-6">
              <div class="w-24 h-24 overflow-hidden rounded-lg border border-gray-100 flex-shrink-0">
                <img [src]="item.image" [alt]="item.full_name" class="w-full h-full object-cover">
              </div>

              <div class="flex-grow text-center sm:text-left">
                <h3 class="text-lg font-semibold text-gray-900">{{ item.full_name }}</h3>
                <p class="text-sm text-gray-500 mb-2">SKU/Model: {{ item.model }}</p>
                <div class="text-primary font-medium text-xl">
                   {{ item.unit_price | currency }}
                   <span class="text-xs text-gray-400 font-normal">per unit</span>
                </div>
              </div>

              <div class="flex flex-col items-center gap-2">
                <div class="flex items-center border rounded-lg overflow-hidden bg-gray-50">
                  <button pButton icon="pi pi-minus"
                          class="p-button-text p-button-plain p-2"
                          (click)="syncQuantity(item.id, item.quantity - 1)"></button>
                  <span class="px-4 font-bold text-gray-700">{{ item.quantity }}</span>
                  <button pButton icon="pi pi-plus"
                          class="p-button-text p-button-plain p-2"
                          (click)="syncQuantity(item.id, item.quantity + 1)"></button>
                </div>
                <button pButton icon="pi pi-trash"
                        class="p-button-danger p-button-text p-button-sm"
                        label="Remove"
                        (click)="commitDelete(item.id)"></button>
              </div>

              <div class="hidden md:block text-right min-w-[120px]">
                <p class="text-xs text-gray-400 uppercase tracking-wider">Subtotal</p>
                <p class="text-xl font-bold text-gray-800">{{ item.subtotal | currency }}</p>
              </div>
            </div>
          </p-card>

          <div *ngIf="cart.items.length === 0" class="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
             <i class="pi pi-shopping-cart text-4xl text-gray-300 mb-4"></i>
             <p class="text-gray-500">Your database-stored cart is empty.</p>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="sticky top-8">
            <p-card styleClass="shadow-md bg-gray-900 text-white border-round-xl">
              <h2 class="text-2xl font-bold mb-6">Order Summary</h2>

              <div class="flex justify-between items-center mb-4 text-gray-400">
                <span>Items Count</span>
                <span>{{ cart.items.length }}</span>
              </div>

              <div class="flex justify-between items-center mb-4 text-green-400 font-medium">
                <span>Total Savings</span>
                <span>- {{ cart.savings | currency }}</span>
              </div>

              <p-divider styleClass="bg-gray-700"></p-divider>

              <div class="flex justify-between items-center my-6">
                <span class="text-lg">Grand Total</span>
                <span class="text-3xl font-black text-white">{{ cart.grand_total | currency }}</span>
              </div>

              <button pButton label="Proceed to Checkout"
                      class="w-full p-button-lg p-button-raised p-button-primary mt-4 py-4 font-bold"></button>

              <p class="text-center text-[10px] text-gray-500 mt-6 uppercase tracking-widest">
                Database Synced: {{ cart.updated_at | date:'HH:mm:ss' }}
              </p>
            </p-card>
          </div>
        </div>

      </div>
    </div>
  `
})
export class Carts implements OnInit {
  cart$: Observable<ShoppingCart | null>;

  constructor(
    private cartService: Cart,
    private messageService: MessageService
  ) {
    this.cart$ = this.cartService.cart$;
  }

  ngOnInit(): void {
    this.cartService.getShoppingCart().subscribe();
  }

  syncQuantity(itemId: number, quantity: number): void {
    if (quantity > 0) {
      this.cartService.updateQuantityToShoppingCart(itemId, quantity).subscribe({
        next: () => {
          this.messageService.add({severity:'success', summary:'Updated', detail:'Cart synchronized with database'});
        },
        error: (err) => {
          // Captures the Inventory logic error from Django's CartItemWriteSerializer
          const errorMessage = err.error?.quantity || err.error?.non_field_errors || 'Stock limit reached';
          this.messageService.add({severity:'error', summary:'Inventory Error', detail: errorMessage});
        }
      });
    }
  }

  commitDelete(itemId: number): void {
    this.cartService.removeItemFromShoppingCart(itemId).subscribe({
      next: () => {
        this.messageService.add({severity:'info', summary:'Removed', detail:'Item deleted from database'});
      }
    });
  }
}
