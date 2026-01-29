import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';
import { CarouselModule } from 'primeng/carousel';
import { ImageModule } from 'primeng/image';
import { Router } from '@angular/router';

@Component({
    selector: 'app-about-us',
    imports: [DividerModule, ButtonModule, ImageModule, RippleModule, CarouselModule],
    template: `
          <div class="max-w-[1440px] mx-auto px-4 lg:px-10 py-12 transition-colors duration-300">

          <header class="flex flex-col items-center text-center mb-24 px-4">
                <span class="text-primary font-bold tracking-widest uppercase text-xs sm:text-sm mb-6 block">
                    Welcome to Daz Electronics
                </span>

                <h1 class="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white mb-10 tracking-tighter leading-none">
                    Smartness for Success
                </h1>

                <p class="max-w-5xl w-full text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed">
                    Tanzania’s premier hub for high-end TV appliances and expert motherboard diagnostics.
                    <span class="md:block mt-2">
                        We bridge the gap between premium retail and specialist technical engineering.
                    </span>
                </p>

                <div class="w-24 h-1.5 bg-primary rounded-full mt-10 opacity-50"></div>
            </header>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 mt-12">
              <div class="group p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div class="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                      <i class="pi pi-shopping-bag text-2xl"></i>
                  </div>
                  <h3 class="text-2xl font-bold mb-4 dark:text-white">Premium Supply</h3>
                  <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      We supply top-tier electronics appliances, focusing on the latest TV technology and high-performance motherboards. Every unit is vetted for peak performance.
                  </p>
                  <div class="flex flex-wrap gap-2">
                      <span class="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-semibold dark:text-slate-300">Smart TVs</span>
                      <span class="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-semibold dark:text-slate-300">Logic Boards</span>
                      <span class="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-semibold dark:text-slate-300">Accessories</span>
                  </div>
              </div>

              <div class="group p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div class="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                      <i class="pi pi-wrench text-2xl"></i>
                  </div>
                  <h3 class="text-2xl font-bold mb-4 dark:text-white">Specialist Workshop</h3>
                  <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      Our workshop breathes life back into "decayed" hardware. We specialize in component-level repair for parts others consider beyond saving.
                  </p>
                  <div class="flex flex-wrap gap-2">
                      <span class="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-full text-xs font-semibold">PSU Repair</span>
                      <span class="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-full text-xs font-semibold">T-Con Specialist</span>
                      <span class="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-full text-xs font-semibold">Panel Bond</span>
                  </div>
              </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] p-8 lg:p-16">
              <div class="lg:col-span-6">
                  <h2 class="text-3xl font-bold mb-6 dark:text-white">Precision Engineering at Your Service</h2>
                  <p class="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                      At Daz Electronics, we don't just replace boards; we fix them. Our technical team is equipped with precision tools to diagnose and repair motherboards, power units, and display controllers. This technical backbone ensures that the products we sell are backed by the best support in the industry.
                  </p>
                  <div class="space-y-4">
                      <div class="flex items-center gap-4 p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-700/50 hover:shadow-md transition-shadow">
                          <div class="w-12 h-12 flex-shrink-0 bg-primary/10 rounded-xl flex items-center justify-center">
                              <i class="pi pi-shield text-primary text-2xl"></i>
                          </div>
                          <div>
                              <h4 class="font-bold text-slate-900 dark:text-white">Quality Electronics, Guaranteed</h4>
                              <p class="text-sm text-slate-500 dark:text-slate-400">Strict 24h stress testing on every motherboard and PSU repair.</p>
                          </div>
                      </div>

                      <div class="flex items-center gap-4 p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-700/50 hover:shadow-md transition-shadow">
                          <div class="w-12 h-12 flex-shrink-0 bg-blue-500/10 rounded-xl flex items-center justify-center">
                              <i class="pi pi-lightbulb text-blue-500 text-2xl"></i>
                          </div>
                          <div>
                              <h4 class="font-bold text-slate-900 dark:text-white">Smartness for Success</h4>
                              <p class="text-sm text-slate-500 dark:text-slate-400">Advanced diagnostics and intelligent engineering for long-lasting electronics.</p>
                          </div>
                      </div>

                      <div class="flex items-center gap-4 p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-700/50 hover:shadow-md transition-shadow">
                          <div class="w-12 h-12 flex-shrink-0 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                              <i class="pi pi-bolt text-emerald-500 text-2xl"></i>
                          </div>
                          <div>
                              <h4 class="font-bold text-slate-900 dark:text-white">Precision & Reliability</h4>
                              <p class="text-sm text-slate-500 dark:text-slate-400">Expert recovery for decayed parts with a focus on quick turnaround and durability.</p>
                          </div>
                      </div>

                  </div>
              </div>
              <div class="lg:col-span-6">

              <div class="relative group">
                <div class="absolute -inset-1 bg-gradient-to-r from-primary to-orange-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>

                <div class="relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl min-h-[400px]">

                    <p-carousel [value]="workshopImages"
                                [numVisible]="1"
                                [numScroll]="1"
                                [circular]="true"
                                [autoplayInterval]="4000">

                        <ng-template let-img #item>
                            <div class="relative w-full h-[400px] lg:h-[550px] overflow-hidden group/item">

                            <p-image
                                [src]="img.url"
                                [alt]="img.alt"
                                width="100%"
                                [preview]="true"
                                appendTo="body"
                                imageClass="w-full h-[400px] lg:h-[550px] object-cover transition-transform duration-700 hover:scale-105">

                                    <ng-template #indicator>
                                        <div class="flex flex-col items-center gap-2">
                                            <i class="pi pi-search-plus text-3xl"></i>
                                            <span class="text-sm font-bold">View Full Details</span>
                                        </div>
                                    </ng-template>
                                </p-image>

                                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent p-8 pointer-events-none">
                                    <div class="flex items-end justify-between">
                                        <div class="max-w-md">
                                            <h4 class="text-white font-bold text-2xl mb-2">{{ img.title }}</h4>
                                            <p class="text-slate-200 text-sm leading-relaxed">{{ img.description }}</p>
                                        </div>
                                        <div class="hidden md:flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest">
                                            <i class="pi pi-expand"></i>
                                            <span>Click Image to Zoom</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </ng-template>
                    </p-carousel>

                </div>
              </div>
                </div>
              </div>

          <div class="text-center py-10">
              <h3 class="text-2xl font-bold dark:text-white mb-6">Need a specialized repair or a new appliance?</h3>
              <div class="flex flex-col sm:flex-row justify-center gap-4">
                  <p-button (click)="redirectToCatalog()" label="Browse Products" icon="pi pi-th-large" styleClass="p-button-primary p-button-lg px-8"></p-button>
                  <p-button (click)="redirectToOurExpert()" label="Contact Our Experts" icon="pi pi-envelope" [outlined]="true" styleClass="p-button-lg px-8"></p-button>
                  <p-button (click)="redirectToOurLocation()" label="Find Us" icon="pi pi-map-marker" styleClass="p-button-primary p-button-lg px-8"></p-button>
              </div>
          </div>
      </div>
    `,
    styles: `

    /* Styling the PrimeNG Preview Mask */
    :host ::ng-deep .p-image-preview-mask {
      background: rgba(15, 23, 42, 0.9); /* slate-900 with transparency */
      backdrop-filter: blur(8px);
    }

    :host ::ng-deep .p-image-toolbar {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(4px);
      border-radius: 0 0 0 12px;
      padding: 10px;
    }

    :host ::ng-deep .p-image-preview-indicator {
      background-color: rgba(99, 102, 241, 0.4); /* Primary color overlay on hover */
      color: #ffffff;
      transition: all 0.3s ease;
    }

    `
})
export class AboutUs {

  private router = inject(Router);

  redirectToCatalog(){
    return this.router.navigate(['/']);
  }

  redirectToOurExpert(){
    return this.router.navigate(['/der/contact']);
  }

  redirectToOurLocation(){
    return this.router.navigate(['/der/location']);
  }

  workshopImages = [
      {
        url: 'assets/images/precision-diagnostics.jpg',
        title: 'Advanced Diagnostics',
        description: 'Using digital microscopes to identify micro-fractures in motherboard circuits.',
        alt: 'Technician using microscope on motherboard'
      },
      {
        url: 'assets/images/t-con-specialist.jpg',
        title: 'T-Con Board Recovery',
        description: 'Specialist repair and replacement of timing controller logic for crystal clear displays.',
        alt: 'Close up of T-Con board repair'
      },
      {
        url: 'assets/images/psu-stabilization.jpg',
        title: 'PSU Engineering',
        description: 'Stabilizing Power Supply Units to protect your TV from voltage fluctuations.',
        alt: 'Power supply unit testing'
      },
      {
        url: 'assets/images/inventory-wide.jpg',
        title: 'Global Supply Chain',
        description: 'Direct sourcing of authentic motherboards and panels from world-class manufacturers.',
        alt: 'Warehouse with electronics stock'
      },
      {
        url: 'assets/images/smart-tv-showroom.jpg',
        title: 'Premium Smart TVs',
        description: 'A curated selection of 4K, OLED, and QLED televisions for the ultimate viewing experience.',
        alt: 'Modern TV showroom display'
      },
      {
        url: 'assets/images/component-level-repair.jpg',
        title: 'Beyond Replacement',
        description: 'We specialize in component-level repair, saving you money by fixing individual chips.',
        alt: 'Soldering station with high-end tools'
      },
      {
        url: 'assets/images/burn-in-testing.jpg',
        title: '24-Hour Stress Test',
        description: 'Rigorous burn-in testing ensures every repaired part is "Guaranteed for Success."',
        alt: 'Row of TVs undergoing testing'
      },
      {
        url: 'assets/images/accessories-gallery.jpg',
        title: 'Genuine Accessories',
        description: 'High-quality remotes, wall mounts, and internal cables to complete your setup.',
        alt: 'Display of TV accessories'
      },
      {
        url: 'assets/images/customer-consultation.jpg',
        title: 'Expert Consultation',
        description: 'Our technical team provides "Smart" advice to ensure you get the right solution.',
        alt: 'Technician talking to a customer'
      },
      {
        url: 'assets/images/final-packaging.jpg',
        title: 'Safe Delivery',
        description: 'Careful handling and anti-static packaging for all electronic components.',
        alt: 'Packaged electronics ready for dispatch'
      }
  ];

}
