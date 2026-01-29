import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [TableModule, ButtonModule, AvatarModule],
  template: `
  <div class="p-6 lg:p-12 bg-slate-50 dark:bg-slate-950 min-h-screen">

<header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
<div>
  <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Welcome back, John!</h1>
  <p class="text-slate-500 text-sm mt-1">Manage your repairs and orders with Smartness for Success.</p>
</div>
<p-button label="New Repair Request" icon="pi pi-plus" styleClass="p-button-primary rounded-xl px-6 shadow-lg shadow-primary/20"></p-button>
</header>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
<div class="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
  <div class="flex items-center gap-4">
    <div class="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500"><i class="pi pi-wrench"></i></div>
    <div>
      <span class="block text-xs text-slate-400 font-bold uppercase tracking-wider">Active Repairs</span>
      <span class="text-2xl font-black dark:text-white">02</span>
    </div>
  </div>
</div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

<div class="lg:col-span-8 space-y-8">
  <section class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
    <h2 class="text-xl font-bold mb-6 dark:text-white flex items-center gap-2">
      <i class="pi pi-spinner pi-spin text-primary"></i> Current Repair Status
    </h2>

    <div class="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 mb-4">
      <div class="flex justify-between items-start mb-6">
        <div>
          <h3 class="font-bold dark:text-white">Samsung 55" QLED Motherboard</h3>
          <p class="text-xs text-slate-500 uppercase">Ticket: #DAZ-8829</p>
        </div>
        <span class="px-4 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded-full uppercase">In Progress</span>
      </div>

      <div class="flex items-center justify-between px-4 relative">
         <div class="absolute h-1 bg-slate-200 dark:bg-slate-700 w-[80%] left-[10%] top-1/2 -translate-y-1/2 -z-10"></div>
         <div class="flex flex-col items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-primary border-4 border-white dark:border-slate-900"></div>
            <span class="text-[10px] font-bold dark:text-slate-400">Received</span>
         </div>
         <div class="flex flex-col items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-primary border-4 border-white dark:border-slate-900"></div>
            <span class="text-[10px] font-bold dark:text-slate-400">Diagnostic</span>
         </div>
         <div class="flex flex-col items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600"></div>
            <span class="text-[10px] font-bold text-slate-400">Repairing</span>
         </div>
         <div class="flex flex-col items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600"></div>
            <span class="text-[10px] font-bold text-slate-400">Testing</span>
         </div>
      </div>
    </div>
  </section>

  <section class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
    <h2 class="text-xl font-bold mb-6 dark:text-white">Recent Hardware Orders</h2>
    <p-table [value]="orders" styleClass="p-datatable-sm" [responsiveLayout]="'scroll'">
      <ng-template pTemplate="header">
        <tr>
          <th class="!bg-transparent dark:!text-slate-400">Item</th>
          <th class="!bg-transparent dark:!text-slate-400">Date</th>
          <th class="!bg-transparent dark:!text-slate-400">Amount</th>
          <th class="!bg-transparent dark:!text-slate-400">Action</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-order>
        <tr class="dark:text-slate-300">
          <td class="py-4 font-medium">{{order.item}}</td>
          <td class="py-4">{{order.date}}</td>
          <td class="py-4 font-bold">{{order.price}}</td>
          <td class="py-4"><p-button icon="pi pi-download" styleClass="p-button-text p-button-sm"></p-button></td>
        </tr>
      </ng-template>
    </p-table>
  </section>
</div>

<div class="lg:col-span-4 space-y-8">
  <div class="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
    <h3 class="font-bold text-lg mb-4">Technical Consultant</h3>
    <p class="text-slate-400 text-sm mb-6">Need a custom quote for a PSU stabilizer or specific motherboard?</p>
    <p-button label="Chat via WhatsApp" icon="pi pi-whatsapp" styleClass="p-button-success w-full rounded-xl"></p-button>
    <i class="pi pi-shield absolute -bottom-6 -right-6 text-9xl text-white/5 pointer-events-none"></i>
  </div>

  <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
     <h3 class="font-bold mb-4 dark:text-white">Your Profile</h3>
     <div class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
        <p-avatar icon="pi pi-user" size="large" shape="circle" styleClass="bg-primary text-white"></p-avatar>
        <div class="flex flex-col">
           <span class="font-bold text-sm dark:text-white">John Mwanza</span>
           <span class="text-xs text-slate-500">Member since 2024</span>
        </div>
     </div>
  </div>
</div>

</div>
</div>
  `
})
export class CustomerDashboard implements OnInit {
  orders: any[] = [];

  ngOnInit() {
    this.orders = [
      { item: 'LG LED Power Supply Unit', date: 'Oct 12, 2025', price: 'Tsh 85,000' },
      { item: 'Universal Backlight Inverter', date: 'Sep 28, 2025', price: 'Tsh 45,000' },
      { item: 'Motherboard Firmware Flash', date: 'Aug 15, 2025', price: 'Tsh 30,000' }
    ];
  }
}
