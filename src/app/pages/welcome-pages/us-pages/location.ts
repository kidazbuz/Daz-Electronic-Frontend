import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';
import { CarouselModule } from 'primeng/carousel';
import { ImageModule } from 'primeng/image';
import { Router } from '@angular/router';

@Component({
    selector: 'app-location',
    imports: [DividerModule, ButtonModule, ImageModule, RippleModule, CarouselModule],
    template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950">
<header class="flex flex-col items-center text-center pt-20 pb-16 px-4">
<span class="text-primary font-bold tracking-[0.3em] uppercase text-xs mb-6 block">
Visit Our Workshop
</span>
<h1 class="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter">
Find Us in Mwanza
</h1>
<p class="max-w-3xl text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
Located in the heart of Karuta, right behind the <span class="font-bold text-slate-900 dark:text-white underline decoration-primary/30">Newhomeland Hotel</span>. Step in for expert diagnostics and premium electronics.
</p>
</header>

<div class="px-4 lg:px-10 mb-12">
<div class="relative w-full h-[600px] rounded-[3rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d395.456690494011!2d32.90039698425277!3d-2.5221613257168687!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19ce7b4c9a354533%3A0x7782e34e7876d7fc!2sNewhomeland%20Hotel!5e0!3m2!1sen!2stz!4v1769525766805!5m2!1sen!2stz" width="800" height="600" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>

<div class="absolute bottom-8 left-8 right-8 md:right-auto md:w-96 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/20">
  <div class="flex items-center gap-4 mb-6">
    <div class="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-primary/30">
      <i class="pi pi-map-marker"></i>
    </div>
    <div>
      <h3 class="font-black text-slate-900 dark:text-white text-xl">Daz Electronics</h3>
      <p class="text-xs font-bold text-primary uppercase tracking-widest">Karuta, Mwanza</p>
    </div>
  </div>

  <div class="space-y-4 text-sm">
    <div class="flex items-start gap-3">
      <i class="pi pi-directions text-slate-400 mt-1"></i>
      <span class="text-slate-600 dark:text-slate-300">Behind Homeland Hotel, Karuta Street</span>
    </div>
    <div class="flex items-start gap-3">
      <i class="pi pi-phone text-slate-400 mt-1"></i>
      <span class="text-slate-600 dark:text-slate-300">0742 077 705</span>
    </div>
  </div>

  <p-button
    label="Get Directions"
    icon="pi pi-external-link"
    styleClass="p-button-primary w-full mt-8 !rounded-xl !py-4"
    >
  </p-button>
</div>
</div>
</div>

<div class="max-w-6xl mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-3 gap-12">
<div class="text-center">
<div class="text-primary text-3xl mb-4 font-black">01</div>
<h4 class="font-bold text-lg mb-2 dark:text-white">Reach Karuta</h4>
<p class="text-slate-500 text-sm">Head towards the Karuta business district in Mwanza city center.</p>
</div>
<div class="text-center">
<div class="text-primary text-3xl mb-4 font-black">02</div>
<h4 class="font-bold text-lg mb-2 dark:text-white">Spot Homeland</h4>
<p class="text-slate-500 text-sm">Look for the Newhomeland Hotel landmark on the main street.</p>
</div>
<div class="text-center">
<div class="text-primary text-3xl mb-4 font-black">03</div>
<h4 class="font-bold text-lg mb-2 dark:text-white">Turn Behind</h4>
<p class="text-slate-500 text-sm">Follow the path directly behind the hotel to find Daz Electronics Or You may call us for assistance</p>
</div>
</div>
</div>
    `
})
export class Location {

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
