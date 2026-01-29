import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';
import { CarouselModule } from 'primeng/carousel';
import { ImageModule } from 'primeng/image';
import { Router } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-contact-us',
    imports: [DividerModule, FormsModule, SelectModule, ButtonModule, ImageModule, RippleModule, CarouselModule],
    template: `
    <div class="max-w-[1440px] mx-auto px-4 lg:px-10 py-12 transition-colors duration-300">

    <header class="flex flex-col items-center text-center mb-24 px-4">
        <span class="text-primary font-bold tracking-widest uppercase text-xs sm:text-sm mb-6 block">
          Get In Touch
        </span>
        <h1 class="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white mb-10 tracking-tighter leading-none">
          Let's Get You Connected
        </h1>
        <p class="max-w-5xl w-full text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed">
          Whether you are looking for premium electronics or need expert recovery for specialized TV components, the Daz Electronics team is ready to assist
        </p>
        <div class="w-24 h-1.5 bg-primary rounded-full mt-10 opacity-50"></div>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 mt-12">
    <a href="https://wa.me/255742077705" target="_blank" class="p-8 rounded-[2rem] bg-emerald-600 text-white shadow-xl hover:-translate-y-2 transition-transform cursor-pointer group">
    <div class="flex justify-between items-start mb-6">
      <i class="pi pi-whatsapp text-4xl"></i>
      <i class="pi pi-arrow-up-right opacity-50 group-hover:opacity-100"></i>
    </div>
    <h3 class="font-bold text-xl mb-2">WhatsApp Us</h3>
    <p class="text-emerald-100 text-sm mb-4">Fastest way to send us photos of your TV parts for a repair quote.</p>
    <span class="font-mono font-bold text-lg">0742 077 705</span>
    </a>

    <div class="p-8 rounded-[2rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 shadow-xl hover:-translate-y-2 transition-transform">
    <i class="pi pi-envelope text-3xl text-primary mb-6 block"></i>
    <h3 class="font-bold text-xl mb-2 dark:text-white">Email Support</h3>
    <p class="text-slate-500 dark:text-slate-400 text-sm mb-4">For bulk supply inquiries and motherboard technical specs.</p>
    <span class="text-primary font-bold">dazelectronics12@gmail.com</span>
    </div>

    <div class="p-8 rounded-[2rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 shadow-xl hover:-translate-y-2 transition-transform">
    <i class="pi pi-phone text-3xl text-blue-500 mb-6 block"></i>
    <h3 class="font-bold text-xl mb-2 dark:text-white">Call / Message</h3>
    <p class="text-slate-500 dark:text-slate-400 text-sm mb-4">Reach out directly for urgent technical support or orders.</p>
    <span class="text-slate-900 dark:text-white font-bold text-lg">0742 077 705</span>
    </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

  <div class="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[3rem] p-8 lg:p-12 border border-slate-100 dark:border-slate-800 shadow-2xl">
    <h2 class="text-3xl font-bold mb-8 dark:text-white">Send a Message</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="flex flex-col gap-2">
        <label class="text-xs font-black uppercase tracking-widest text-slate-400">Full Name</label>
        <input type="text" pInputText class="!rounded-xl !p-4 !bg-slate-50 dark:!bg-slate-800 !border-none" placeholder="Enter name">
      </div>

      <div class="flex flex-col gap-2">
        <label for="inquiryType" class="text-xs font-black uppercase tracking-widest text-slate-400">Inquiry Type</label>
        <p-select
            id="inquiryType"
            [options]="inquiryOptions"
            [(ngModel)]="selectedInquiry"
            optionLabel="name"
            placeholder="Select Service"
            [filter]="true"
            filterBy="name"
            appendTo="body"
            [showClear]="true"
            fluid
            styleClass="!rounded-xl !bg-slate-50 dark:!bg-slate-800 !border-none !shadow-none !h-[56px] flex items-center">
            <ng-template #item let-item>
                <div class="flex items-center gap-3 py-1">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-700">
                        <i [class]="item.icon" [style.color]="item.color"></i>
                    </div>
                    <div class="flex flex-col">
                      <span class="font-bold text-sm dark:text-slate-200">{{ item.name }}</span>
                      <span class="text-[10px] text-slate-500 uppercase tracking-tighter">{{ item.sub }}</span>
                    </div>
                </div>
            </ng-template>
        </p-select>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="flex flex-col gap-2">
        <label class="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</label>
        <input type="email" pInputText class="!rounded-xl !p-4 !bg-slate-50 dark:!bg-slate-800 !border-none" placeholder="dazelectronics12@gmail.com">
      </div>
      <div class="flex flex-col gap-2">
        <label class="text-xs font-black uppercase tracking-widest text-slate-400">Phone Number</label>
        <input type="text" pInputText class="!rounded-xl !p-4 !bg-slate-50 dark:!bg-slate-800 !border-none" placeholder="0742 077 705">
      </div>
    </div>

    <div class="flex flex-col gap-2 mb-8">
      <label class="text-xs font-black uppercase tracking-widest text-slate-400">Your Message</label>
      <textarea pInputTextarea rows="5" class="!rounded-xl !p-4 !bg-slate-50 dark:!bg-slate-800 !border-none" placeholder="Describe your technical issue or the appliance you need..."></textarea>
    </div>

    <p-button label="Send Message" icon="pi pi-send" styleClass="p-button-lg px-10 !rounded-2xl w-full md:w-auto"></p-button>
  </div>

  <div class="lg:col-span-5 space-y-6">
  <div class="bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] overflow-hidden h-64 border border-slate-100 dark:border-slate-700 shadow-inner relative">
  <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d395.45671393591516!2d32.90062626007757!3d-2.5220842189756985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2stz!4v1769523204358!5m2!1sen!2stz" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>

<div class="absolute bottom-4 left-4 pointer-events-none bg-white/80 dark:bg-slate-900/80 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border border-white/20">
  Near New Homeland Hotel
</div>
</div>

    <div class="bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700">
      <div class="flex items-center gap-4 mb-6">
        <div class="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
          <i class="pi pi-map-marker"></i>
        </div>
        <div>
          <h4 class="font-bold dark:text-white">Karuta, Mwanza</h4>
          <p class="text-xs text-slate-500 font-bold uppercase tracking-tight">Behind Homeland Hotel</p>
        </div>
      </div>

      <div class="space-y-4">
        <h5 class="text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Operating Hours</h5>
        <ul class="space-y-3 text-sm">
          <li class="flex justify-between">
            <span class="text-slate-500">Mon - Sat:</span>
            <span class="dark:text-white font-bold">8:00 AM - 5:00 PM</span>
          </li>
          <li class="flex justify-between">
            <span class="text-red-400">Sunday:</span>
            <span class="text-red-400 font-bold">Closed</span>
          </li>
        </ul>
      </div>
    </div>

  </div>
</div>
</div>
    `
})
export class ContactUs {

  private router = inject(Router);

  redirectToCatalog(){
    return this.router.navigate(['/']);
  }

  redirectToOurExpert(){
    return this.router.navigate(['/der/contact']);
  }

  selectedInquiry: any;

  inquiryOptions = [
    {
      name: 'TV Repair Request',
      icon: 'pi pi-desktop',
      color: '#ef4444',
      sub: 'PSU, T-Con, Panels'
    },
    {
      name: 'Motherboard Supply',
      icon: 'pi pi-microchip',
      color: '#6366f1',
      sub: 'Parts & Components'
    },
    {
      name: 'General Inquiry',
      icon: 'pi pi-question-circle',
      color: '#10b981',
      sub: 'Business & Sales'
    },
    {
      name: 'Warranty Support',
      icon: 'pi pi-shield',
      color: '#f59e0b',
      sub: 'After-sales service'
    }
  ];

}
