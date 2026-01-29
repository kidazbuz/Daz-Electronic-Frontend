import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'app-check-out',
    imports: [DividerModule, ButtonModule, RippleModule],
    template: `
    <div class="max-w-7xl mx-auto p-6 bg-surface-50 min-h-screen">
<h1 class="text-3xl font-bold mb-2">Checkout</h1>
<p class="text-surface-500 mb-8">Please fill in your details to complete your order</p>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

<div class="lg:col-span-2 space-y-8">

  <div class="bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
    <h2 class="text-lg font-bold mb-6 flex items-center gap-2">
      <i class="pi pi-user text-primary"></i> Contact Information
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="flex flex-col gap-2">
        <label class="text-sm font-semibold">Full Name <span class="text-red-500">*</span></label>
        <input pInputText placeholder="Your full name" class="w-full" />
      </div>
      <div class="flex flex-col gap-2">
        <label class="text-sm font-semibold">Email Address <span class="text-red-500">*</span></label>
        <input pInputText type="email" placeholder="your@email.com" class="w-full" />
      </div>
    </div>

    <div class="mt-6 flex flex-col gap-2">
      <label class="text-sm font-semibold">Payment Method <span class="text-red-500">*</span></label>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 border-2 border-primary rounded-lg cursor-pointer bg-primary-50/10">
          <div class="flex items-center gap-3">
            <i class="pi pi-wallet text-xl text-primary"></i>
            <div>
              <div class="font-bold text-sm">Cash on Delivery</div>
              <div class="text-xs text-surface-500">Pay when you receive</div>
            </div>
          </div>
        </div>
        </div>
    </div>
  </div>

  <div class="bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
    <h2 class="text-lg font-bold mb-6 flex items-center gap-2">
      <i class="pi pi-map-marker text-primary"></i> Shipping Address
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="flex flex-col gap-2">
        <label class="text-sm font-semibold">Region <span class="text-red-500">*</span></label>
        
      </div>
      <div class="flex flex-col gap-2">
        <label class="text-sm font-semibold">District/Area <span class="text-red-500">*</span></label>

      </div>
    </div>
  </div>
</div>

<div class="space-y-6">
  <div class="bg-white p-6 rounded-xl border border-surface-200 shadow-sm sticky top-6">
    <h2 class="text-lg font-bold mb-6">Order Summary</h2>

    <div class="space-y-4 pb-4 border-b border-surface-100">
      <div class="flex justify-between items-start">
        <div>
          <div class="font-semibold">tenda bridge</div>
          <div class="text-xs text-surface-500">Qty: 1</div>
        </div>
        <div class="font-bold">Tsh 250,000</div>
      </div>
    </div>

    <div class="py-4 space-y-2 text-sm">
      <div class="flex justify-between text-surface-600">
        <span>Subtotal</span>
        <span>Tsh 250,000</span>
      </div>
      <div class="flex justify-between text-surface-600">
        <span>VAT (18%)</span>
        <span>Tsh 45,000</span>
      </div>
      <div class="flex justify-between text-green-600">
        <span>Shipping</span>
        <span class="font-medium">Free</span>
      </div>
    </div>

    <div class="pt-4 flex justify-between items-center text-lg font-bold text-primary">
      <span>Total Amount</span>
      <span>Tsh 295,000</span>
    </div>

    <p-button label="Place Order" icon="pi pi-check-circle" styleClass="w-full mt-6 py-3 font-bold" severity="primary"></p-button>
  </div>
</div>

</div>
</div>
    `
})
export class CheckOut {}
