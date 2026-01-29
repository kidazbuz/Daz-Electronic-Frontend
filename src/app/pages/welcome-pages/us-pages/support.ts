import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';
import { CarouselModule } from 'primeng/carousel';
import { ImageModule } from 'primeng/image';
import { Router } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';

@Component({
    selector: 'app-support',
    imports: [DividerModule, AccordionModule, ButtonModule, ImageModule, RippleModule, CarouselModule],
    template: `
    <div class="max-w-[1440px] mx-auto px-4 lg:px-10 py-12">

    <header class="flex flex-col items-center text-center mb-24 px-4 pt-8">
        <span class="text-primary font-bold tracking-widest uppercase text-xs sm:text-sm mb-6 block">
          Support Center
        </span>

        <h1 class="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white mb-10 tracking-tighter leading-none">
          Technical Support Hub
        </h1>

        <p class="max-w-5xl w-full text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed mb-12">
          Find solutions for your TV components, motherboard diagnostics, and PSU stabilization.
          Our experts are here to ensure your hardware runs with "Smartness for Success."
        </p>

        <div class="w-full max-w-2xl relative group">
            <div class="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

            <div class="relative mt-4">
                <i class="pi pi-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-xl"></i>
                <input
                    type="text"
                    pInputText
                    class="w-full !rounded-2xl !py-6 !pl-16 !pr-8 !border-none !bg-white dark:!bg-slate-900 !shadow-2xl !text-lg text-slate-900 dark:text-white"
                    placeholder="Search motherboard models, fault codes...">
            </div>
        </div>

        <div class="w-24 h-1.5 bg-primary rounded-full mt-16 opacity-50"></div>
    </header>


<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 mt-12">
<div class="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-2 transition-transform">
<div class="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6 text-2xl">
  <i class="pi pi-bolt"></i>
</div>
<h3 class="font-bold text-xl mb-3 dark:text-white">Power Issues</h3>
<p class="text-slate-500 text-sm mb-4">TV won't turn on or clicking sounds coming from the back? Check PSU diagnostics.</p>
<a href="#" class="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2">Read Guide <i class="pi pi-arrow-right"></i></a>
</div>

<div class="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-2 transition-transform">
<div class="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6 text-2xl">
  <i class="pi pi-desktop"></i>
</div>
<h3 class="font-bold text-xl mb-3 dark:text-white">Display & T-Con</h3>
<p class="text-slate-500 text-sm mb-4">Lines on screen, ghosting, or no image but sound is working? This is a T-con/Panel issue.</p>
<a href="#" class="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2">Read Guide <i class="pi pi-arrow-right"></i></a>
</div>

<div class="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-2 transition-transform">
<div class="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 text-2xl">
  <i class="pi pi-refresh"></i>
</div>
<h3 class="font-bold text-xl mb-3 dark:text-white">Firmware Updates</h3>
<p class="text-slate-500 text-sm mb-4">Smart TV stuck on logo or restarting? You might need a motherboard firmware flash.</p>
<a href="#" class="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2">Read Guide <i class="pi pi-arrow-right"></i></a>
</div>
</div>

<div class="max-w-4xl mx-auto">
<div class="text-center mb-12">
<h2 class="text-3xl font-bold dark:text-white mb-4">Common Repair Questions</h2>
<p class="text-slate-500">Expert answers for "Smartness for Success."</p>
</div>

<div class="max-w-4xl mx-auto px-4">

  <p-accordion [value]="['0']" class="custom-daz-accordion">

    <p-accordion-panel value="0" class="mb-4 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] overflow-hidden">
      <p-accordion-header class="!bg-white dark:!bg-slate-900 !py-6 !px-8 hover:!bg-slate-50 dark:hover:!bg-slate-800/50 transition-colors">
        <span class="font-bold text-slate-900 dark:text-white">What is a 'decayed' component recovery?</span>
      </p-accordion-header>
      <p-accordion-content>
        <div class="p-8 pt-0 bg-white dark:bg-slate-900">
          <p class="leading-relaxed text-slate-600 dark:text-slate-400">
            Decayed components are parts that have failed due to oxidation, heat stress, or moisture. Our technicians don't just replace boards; we clean, stabilize, and rebuild paths on the motherboard to restore original performance using precision soldering.
          </p>
        </div>
      </p-accordion-content>
    </p-accordion-panel>

    <p-accordion-panel value="1" class="mb-4 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] overflow-hidden">
      <p-accordion-header class="!bg-white dark:!bg-slate-900 !py-6 !px-8 hover:!bg-slate-50 dark:hover:!bg-slate-800/50 transition-colors">
        <span class="font-bold text-slate-900 dark:text-white">How long does a standard TV motherboard repair take?</span>
      </p-accordion-header>
      <p-accordion-content>
        <div class="p-8 pt-0 bg-white dark:bg-slate-900">
          <p class="leading-relaxed text-slate-600 dark:text-slate-400">
            Most diagnostics are completed within 24 hours. Once the repair is finalized, we perform a mandatory 24-hour stress test to ensure the "Smartness for Success" guarantee before you pick up your device.
          </p>
        </div>
      </p-accordion-content>
    </p-accordion-panel>

    <p-accordion-panel value="2" class="mb-4 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] overflow-hidden">
      <p-accordion-header class="!bg-white dark:!bg-slate-900 !py-6 !px-8 hover:!bg-slate-50 dark:hover:!bg-slate-800/50 transition-colors">
        <span class="font-bold text-slate-900 dark:text-white">Do you provide original Samsung/LG parts in Mwanza?</span>
      </p-accordion-header>
      <p-accordion-content>
        <div class="p-8 pt-0 bg-white dark:bg-slate-900">
          <p class="leading-relaxed text-slate-600 dark:text-slate-400">
            Yes, Daz Electronics sources original components directly. If a specific board is discontinued, our experts can suggest and install high-quality alternatives that match the technical specs of your device perfectly.
          </p>
        </div>
      </p-accordion-content>
    </p-accordion-panel>

  </p-accordion>
</div>
</div>
</div>
    `,
    styles: `

    ::ng-deep .custom-support-accordion .p-accordion-header .p-accordion-header-link {
        background: transparent;
        border: none;
        font-weight: 700;
        padding: 1.5rem;
        border-radius: 1.5rem;
        color: var(--text-color);
        transition: all 0.3s;
    }

    ::ng-deep .custom-support-accordion .p-accordion-tab {
        margin-bottom: 1rem;
        border: 1px solid #f1f5f9; /* Slate-100 */
        border-radius: 1.5rem;
    }

    .dark ::ng-deep .custom-support-accordion .p-accordion-tab {
        border: 1px solid #1e293b; /* Slate-800 */
        background: #0f172a;
    }

    `
})
export class Support {

  private router = inject(Router);

  redirectToCatalog(){
    return this.router.navigate(['/']);
  }

  redirectToOurExpert(){
    return this.router.navigate(['/der/contact']);
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
