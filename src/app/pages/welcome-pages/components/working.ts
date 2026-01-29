import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'app-working',
    imports: [DividerModule, ButtonModule, RippleModule],
    template: `
        <div class="max-w-[1440px] mx-auto px-6 lg:px-20">
        <div class="bg-white dark:bg-slate-900 border border-surface-200 dark:border-surface-700 rounded-xl shadow-sm overflow-hidden">
          <div class="grid grid-cols-1 md:grid-cols-3">

              <div class="p-8 flex items-center gap-5 group hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div class="flex-shrink-0">
                      <i class="pi pi-truck text-3xl text-[#9D174D]"></i>
                  </div>
                  <div class="flex flex-col">
                      <span class="text-lg font-bold text-slate-900 dark:text-white mb-0.5">Fast Delivery</span>
                      <p class="text-slate-500 dark:text-slate-400 text-sm leading-snug">
                          For all items bought at Daz Electronics
                      </p>
                  </div>
              </div>

              <div class="p-8 flex items-center gap-5 border-y md:border-y-0 md:border-x border-surface-200 dark:border-surface-700 group hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div class="flex-shrink-0">
                      <i class="pi pi-star text-3xl text-[#9D174D]"></i>
                  </div>
                  <div class="flex flex-col">
                      <span class="text-lg font-bold text-slate-900 dark:text-white mb-0.5">Five Star Quality</span>
                      <p class="text-slate-500 dark:text-slate-400 text-sm leading-snug">
                          Best and Quality Products guaranteed
                      </p>
                  </div>
              </div>

              <div class="p-8 flex items-center gap-5 group hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div class="flex-shrink-0">
                      <i class="pi pi-lock text-3xl text-[#9D174D]"></i>
                  </div>
                  <div class="flex flex-col">
                      <span class="text-lg font-bold text-slate-900 dark:text-white mb-0.5">High Secured</span>
                      <p class="text-slate-500 dark:text-slate-400 text-sm leading-snug">
                        We protect your privacy and products
                      </p>
                  </div>
              </div>

          </div>
        </div>
    </div>
    `
})
export class Working {}
