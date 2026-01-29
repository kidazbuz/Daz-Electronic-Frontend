import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { Component, signal, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Slide } from '../../../shared/interfaces/home';
import { RouterModule, Router } from '@angular/router';

@Component({
    selector: 'hero-widget',
    imports: [ButtonModule, RippleModule, RouterModule],
    template: `
    <section class="slideshow-section">
      <div class="slideshow-container relative overflow-hidden h-[300px] md:h-[400px]">
        @for (slide of slides(); track $index) {
          <div class="slide-item absolute inset-0 flex items-center transition-all duration-700 ease-in-out"
               [class]="slide.imgClass"
               [style.opacity]="currentSlide() === $index ? '1' : '0'"
               [style.visibility]="currentSlide() === $index ? 'visible' : 'hidden'"
               [style.z-index]="currentSlide() === $index ? '10' : '1'">

            <div class="max-w-[1440px] mx-auto px-6 lg:px-20 w-full">
              <div class="flex flex-col items-start">

                <h2 class="slide-subtitle text-primary font-semibold tracking-widest mb-2"
                    [class.animate-fade-in-up] ="currentSlide() === $index">
                  {{ slide.subtitle }}
                </h2>

                <h4 class="slide-title text-5xl md:text-7xl font-bold text-gray-900 dark:text-white leading-tight mb-6"
                    [class.animate-fade-in-up-delayed] ="currentSlide() === $index">
                  {{ slide.title }}
                </h4>

                <div [class.animate-fade-in-up-more-delayed]="currentSlide() === $index">
                  <a [routerLink]="slide.link"
                     pButton pRipple
                     [label]="slide.cta"
                     class="p-button-rounded p-button-raised text-xl px-8 py-3 no-underline inline-block">
                  </a>
                </div>

              </div>
            </div>
          </div>
        }

        <button (click)="prevSlide()"
                class="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white border-none cursor-pointer transition-all">
          <i class="pi pi-chevron-left text-2xl"></i>
        </button>

        <button (click)="nextSlide()"
                class="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white border-none cursor-pointer transition-all">
          <i class="pi pi-chevron-right text-2xl"></i>
        </button>

        <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          @for (slide of slides(); track $index) {
            <button (click)="setCurrentSlide($index)"
                    class="h-3 rounded-full transition-all duration-300 border-none cursor-pointer"
                    [class]="currentSlide() === $index ? 'w-10 bg-primary' : 'w-3 bg-white/50'"
                    [attr.aria-label]="'Go to slide ' + ($index + 1)">
            </button>
          }
        </div>
      </div>
      </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroWidget implements OnInit, OnDestroy {

  private slideInterval: any;
  private readonly AUTO_PLAY_SPEED = 5000; // 5 seconds

  slides = signal<Slide[]>([
    {
      title: 'Original TV Panels & Mirror Modules',
      subtitle: 'Premium replacement screens for Samsung, LG, Sony, and more. 4K & UHD ready.',
      cta: 'Explore Panels',
      link: '/der/screens',
      imgClass: 'slide-panels'
    },
    {
      title: 'Mainboards: Original & Universal',
      subtitle: 'From Smart Android boards to specific brand replacements. Restore TV logic today.',
      cta: 'Shop Motherboards',
      link: '/der/motherboards',
      imgClass: 'slide-motherboards'
    },
    {
      title: 'Full Array LED Backlight Strips',
      subtitle: 'Solve blue tint or dark screen issues with our 100% new LED backlight arrays.',
      cta: 'Find My Strips',
      link: '/der/backlights',
      imgClass: 'slide-led'
    },
    {
      title: 'T-Con Boards & Timing Logic',
      subtitle: 'Fixing ghosting, vertical lines, and color distortions with precision boards.',
      cta: 'Browse T-Con',
      link: '/der/t-con',
      imgClass: 'slide-tcon'
    },
    {
      title: 'Power Supply Units (PSU)',
      subtitle: 'Reliable power modules to fix TVs that won’t turn on or have standby issues.',
      cta: 'View Power Boards',
      link: '/der/power-supply',
      imgClass: 'slide-psu'
    },
    {
      title: 'Expert Software & Firmware Library',
      subtitle: 'Direct USB download for EMMC flashing and Smart TV OS troubleshooting.',
      cta: 'Download Files',
      link: '/der/software',
      imgClass: 'slide-software'
    },
    {
      title: 'LVDS & Flex Ribbon Cables',
      subtitle: 'High-density connector cables for seamless signal transfer from board to panel.',
      cta: 'See Connectors',
      link: '/der/cables',
      imgClass: 'slide-cables'
    },
    {
      title: 'COF/TAB Bonding ICs',
      subtitle: 'Professional-grade COF for specialized panel technicians and bonding machines.',
      cta: 'Bulk Order COF',
      link: '/der/specialized',
      imgClass: 'slide-cof'
    },
    {
      title: 'TV Repair Tools & Accessories',
      subtitle: 'Backlight testers, suction cups for panels, and universal remote controls.',
      cta: 'Shop Tools',
      link: '/der/accessories',
      imgClass: 'slide-tools'
    },
    {
      title: 'Wholesale Repair Bundles',
      subtitle: 'Special pricing for workshops. Get Motherboard + Remote + Cable kits.',
      cta: 'Wholesale Deals',
      link: '/der/deals',
      imgClass: 'slide-deals'
    }
]);

  currentSlide = signal(0);

  ngOnInit() {
    this.startSlideshow();
  }

  ngOnDestroy() {
    this.stopSlideshow();
  }

  // --- Slideshow Logics ---

  startSlideshow(): void {
    // Ensure no multiple intervals are running
    this.stopSlideshow();
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, this.AUTO_PLAY_SPEED);
  }

  stopSlideshow(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  /**
   * Resets the timer whenever a user interacts with the controls
   * to prevent the slide from jumping immediately after a click.
   */
  private resetSlideshowTimer(): void {
    this.startSlideshow();
  }

  nextSlide(): void {
    this.currentSlide.update(current =>
      (current + 1) % this.slides().length
    );
    this.resetSlideshowTimer();
  }

  prevSlide(): void {
    this.currentSlide.update(current =>
      (current - 1 + this.slides().length) % this.slides().length
    );
    this.resetSlideshowTimer();
  }

  setCurrentSlide(index: number): void {
    this.currentSlide.set(index);
    this.resetSlideshowTimer();
  }


}
