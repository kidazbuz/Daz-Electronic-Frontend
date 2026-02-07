import {
  Component,
  signal,
  OnInit,
  HostListener,
  OnDestroy,
  AfterViewInit,
  inject,
  viewChild,
  ElementRef,
  Injectable
} from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  Observable,
  of,
  switchMap,
  debounceTime,
  tap,
  finalize,
  startWith,
  catchError
} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { StyleClassModule } from 'primeng/styleclass';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import {AppFloatingConfigurator} from "@/layout/component/app.floatingconfigurator";
import { NavLink } from '../../../shared/interfaces/home';
import { Master } from '../../../shared/services/master';

@Component({
    selector: 'topbar-widget',
    imports: [RouterModule, StyleClassModule, ReactiveFormsModule, ButtonModule, RippleModule, CommonModule, AppFloatingConfigurator],
    template: `<header class="fixed top-0 left-0 right-0 z-[100] bg-white dark:bg-slate-900 shadow-md border-b border-gray-100 dark:border-slate-800">

  <div class="max-w-[1440px] mx-auto px-4 lg:px-6 h-16 md:h-20 flex items-center justify-between gap-4">

    <div class="flex items-center gap-2 md:gap-3 flex-shrink-0 cursor-pointer group" routerLink="/">

      <span class="text-xl md:text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-none whitespace-nowrap pt-0.5">

          <div class="color-adaptive-main w-9 h-9 md:w-11 md:h-11 flex-shrink-0">{{ brand }}</div>

      </span>
    </div>

    <div class="hidden lg:flex flex-1 max-w-2xl relative mx-10">
      <div class="relative w-full group">
        <i class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-60"></i>
        <input
            #desktopSearchInput
            [formControl]="searchControl"
            type="text"
            placeholder="Search products..."
            class="w-full pl-11 pr-4 py-2.5 rounded-lg border outline-none transition-all shadow-sm"
            style="
              background-color: var(--surface-ground);
              color: var(--text-color);
              border-color: var(--surface-border);
            "
            (focus)="showInput()"
          >
      </div>

      @if (isVisible() && !isLoading()) {
      <div
        class="absolute top-full left-0 mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 z-[110] overflow-hidden animate-fade-in"
        (mousedown)="onMouseDown($event)">

        <div class="flex flex-col max-h-[50vh] overflow-y-auto">
          @for (product of foundItems(); track product.id) {

            @for (spec of product.specifications; track spec.id) {
              <a
                [routerLink]="['/der/product', spec.id]"
                (click)="hideInput(true)"
                class="p-4 pl-8 flex items-center hover:bg-primary/5 border-b border-gray-50 dark:border-slate-700/50 last:border-none no-underline transition-colors group"
              >
                <i class="pi pi-box mr-3 text-primary opacity-50 group-hover:opacity-100 transition-opacity"></i>
                <div class="flex flex-col">
                  <span class="font-medium text-slate-700 dark:text-slate-200 text-sm">
                    {{ spec.parent_product_name }}
                  </span>
                  <span class="text-[11px] text-slate-400 font-mono">
                    Model: {{ spec.model }} • SKU: {{ spec.sku }}
                  </span>
                </div>
                <span class="ml-auto text-xs font-bold text-primary">{{ spec.discounted_price }}</span>
              </a>
            }

            @for (fw of product.firmwares; track fw.id) {
              <a
                [routerLink]="['/der/software', fw.id]"
                (click)="hideInput(true)"
                class="p-4 pl-8 flex items-center hover:bg-blue-500/5 border-b border-gray-50 dark:border-slate-700/50 last:border-none no-underline transition-colors group"
              >
                <i class="pi pi-file-export mr-3 text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity"></i>
                <div class="flex flex-col">
                  <span class="font-medium text-slate-700 dark:text-slate-200 text-sm">
                    Firmware: {{ fw.board_number }}
                  </span>
                  <span class="text-[11px] text-slate-400 font-mono">
                    {{ fw.software_type_display }} • Panel: {{ fw.panel_model }}
                  </span>
                </div>
                <span class="ml-auto text-[10px] text-blue-500 font-semibold">{{ fw.size_mb }} MB</span>
              </a>
            }

          } @empty {
            <div class="p-8 text-center">
              <i class="pi pi-exclamation-circle text-2xl text-slate-300 mb-2 block"></i>
              <div class="text-slate-500 italic">
                No matches for "<span class="font-semibold text-primary">{{ searchControl.value }}</span>"
              </div>
            </div>
          }
        </div>
      </div>
    }
    </div>

    <div class="flex items-center gap-2 md:gap-4">
      <button (click)="toggleSearch()" class="lg:hidden p-2.5 text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
        <i class="pi pi-search text-xl text-primary opacity-60"></i>
      </button>

      <a routerLink="/account/login" class="flex items-center gap-2 p-2 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
        <i class="pi pi-user text-xl"></i>
        <span class="hidden xl:inline text-sm font-semibold">Sign in / Register</span>
      </a>

      <a routerLink="/der/cart" class="relative p-2 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
        <i class="pi pi-shopping-cart text-xl"></i>
        @if (cartCount() > 0) {
          <span class="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
            {{ cartCount() }}
          </span>
        }
      </a>

      <div class="hidden lg:flex items-center gap-1 border-l ml-2 pl-3 dark:border-slate-700">
      <div class="flex justify-center">
            <app-floating-configurator [float]="false" />
        </div>
      </div>

      <button (click)="toggleMenu()" class="lg:hidden p-2.5 text-slate-600 dark:text-slate-300">
        <i [class]="isMobileMenuOpen() ? 'pi pi-times' : 'pi pi-bars'" class="text-xl"></i>
      </button>
    </div>
  </div>

  <nav class="hidden lg:block border-t border-gray-50 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
    <div class="max-w-[1440px] mx-auto px-6 py-3">
      <ul class="flex justify-center items-center gap-8">
        @for (link of primaryNavLinks; track link.label) {
          <li>
            <a [routerLink]="link.link" routerLinkActive="text-primary font-bold" class="text-[13px] tracking-wider font-semibold text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-all">
              {{ link.label }}
            </a>
          </li>
        }
      </ul>
    </div>
  </nav>

  @if (isMobileSearchVisible()) {
  <div class="lg:hidden bg-white dark:bg-slate-900 p-4 border-t border-gray-100 dark:border-slate-800 animate-slide-down">
    <div class="relative">
      <i class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-60"></i>
      <input
        [formControl]="searchControl"
        type="text"
        placeholder="Search for models, board numbers..."
        class="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary"
        autofocus
      >
    </div>

    @if (isVisible() && !isLoading()) {
      <div class="mt-2 max-h-[60vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div class="flex flex-col">
          @for (product of foundItems(); track product.id) {

            @for (spec of product.specifications; track spec.id) {
              <a
                [routerLink]="['/der/product', spec.id]"
                (click)="hideInput(true)"
                class="pl-8 pr-4 py-3 flex items-center hover:bg-primary/5 border-b border-gray-50 dark:border-slate-700/50 last:border-none no-underline transition-colors active:bg-gray-100"
              >
                <i class="pi pi-box mr-3 text-[12px] text-slate-400"></i>
                <div class="flex flex-col">
                  <span class="text-sm text-slate-700 dark:text-slate-200">
                    Model: {{ spec.model }}
                  </span>
                  <span class="text-[10px] text-slate-400 font-mono">
                    {{ spec.screen_size_name }}" {{ spec.resolution_name }} • {{ spec.brand_name }}
                  </span>
                </div>
              </a>
            }

            @for (fw of product.firmwares; track fw.id) {
              <a
                [routerLink]="['/der/software', fw.id]"
                (click)="hideInput(true)"
                class="pl-8 pr-4 py-3 flex items-center hover:bg-primary/5 border-b border-gray-50 dark:border-slate-700/50 last:border-none no-underline transition-colors active:bg-gray-100"
              >
                <i class="pi pi-file-export mr-3 text-[12px] text-blue-500"></i>
                <div class="flex flex-col">
                  <span class="text-sm text-slate-700 dark:text-slate-200">
                    Firmware: {{ fw.board_number }}
                  </span>
                  <span class="text-[10px] text-slate-400 font-mono">
                    {{ fw.software_type_display }} • Panel: {{ fw.panel_model }}
                  </span>
                </div>
              </a>
            }

          } @empty {
            <div class="p-6 text-center">
              <div class="text-slate-500 text-sm italic">
                No matches for "<span class="text-primary font-semibold">{{ searchControl.value }}</span>"
              </div>
            </div>
          }
        </div>
      </div>
    }
  </div>
}
</header>

@if (isMobileMenuOpen()) {
  <div class="fixed inset-0 z-[150] lg:hidden">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" (click)="toggleMenu()"></div>

    <aside class="absolute inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-slide-right">
    <div class="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
      <div class="flex items-center gap-3">
        <div class="color-adaptive-small h-10 w-10 flex-shrink-0"></div>

        <span class="font-bold text-slate-800 dark:text-white text-lg tracking-tight leading-none">
          {{ brand }}
        </span>
      </div>

      <button (click)="toggleMenu()" class="p-2">
        <i class="pi pi-times"></i>
      </button>
    </div>

      <div class="flex-1 overflow-y-auto py-4">
        <div class="px-4 mb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Navigation</div>
        @for (link of primaryNavLinks; track link.label) {
          <a [routerLink]="link.link" (click)="toggleMenu()" class="flex items-center px-6 py-3.5 hover:bg-primary/5 text-slate-700 dark:text-slate-300 font-medium border-l-4 border-transparent hover:border-primary transition-all">
            {{ link.label }}
          </a>
        }

        <div class="mt-6 px-4 mb-4 text-[10px] font-bold text-gray-400 tracking-widest">Preferences</div>
        <div class="flex items-center justify-around px-6 py-4 bg-gray-50 dark:bg-slate-800/30 mx-4 rounded-xl">
          <div class="flex justify-center">
                <app-floating-configurator [float]="false" />
            </div>
        </div>
      </div>
    </aside>
  </div>
}

<div class="h-[15px] md:h-[70px] lg:h-[70px]"></div>`
})
export class TopbarWidget implements OnInit, AfterViewInit, OnDestroy {

  private router = inject(Router);
  private searchService = inject(Master);
  public brand = 'Daz Electronics'

  readonly primaryNavLinks: NavLink[] = [
    { label: 'Home', link: '/' },
    { label: 'TV Screens', link: '/der/screens' },
    { label: 'Motherboards', link: '/der/motherboards' },
    { label: 'T-Con', link: '/der/t-con' },
    { label: 'Accessories', link: '/der/accessories' },
    { label: 'Software', link: '/der/software' },
    { label: 'Deals', link: '/der/deals' },
    { label: 'Tracking', link: '/der/tracking' },
    { label: 'About', link: '/der/about' },
    { label: 'Contact', link: '/der/contact' },
    { label: 'Support', link: '/der/support' },
  ];
  readonly utilityLinks: NavLink[] = [
    { label: 'Sign in / Register', link: '/der/account/login' },
    { label: 'Cart', link: '/der/cart' },
  ];

  isMobileMenuOpen = signal(false);
  isMobileSearchVisible = signal(false);
  private readonly lgBreakpoint = 1024;
  cartCount = signal(0);

  searchControl = new FormControl('', { nonNullable: true });
  isVisible = signal(false);
  isLoading = signal(false);

  searchPosition = signal({
    top: '0px',
    left: '0px',
    width: '300px'
  });

  desktopSearchInput = viewChild<ElementRef<HTMLInputElement>>('desktopSearchInput');
  private mouseDownOnElement = false;

  private searchResults$ = this.searchControl.valueChanges.pipe(
    startWith(this.searchControl.value),
    debounceTime(300),
    tap(() => {
        const term = this.searchControl.value.trim();
        if (term.length > 0) {
            this.isLoading.set(true);
            this.isVisible.set(true);
        } else {
             this.isVisible.set(false);
        }
    }),
    switchMap(term => {
        const query = term.trim();
        if (query.length === 0) {
            this.isLoading.set(false);
            return of([]);
        }
        return this.searchService.fetchProducts(query).pipe(
            finalize(() => this.isLoading.set(false))
        );
    })
  );

  foundItems = toSignal(this.searchResults$, { initialValue: [] });

  ngOnInit() {

  }

  ngAfterViewInit() {
    if (this.isDesktop()) {
        this.updateSearchPosition();
    }
    window.addEventListener('resize', this.updateSearchPosition.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.updateSearchPosition.bind(this));
  }


  isDesktop(): boolean {
    return typeof window !== 'undefined' ? window.innerWidth >= this.lgBreakpoint : false;
  }


  toggleMenu(): void {
    this.isMobileMenuOpen.update(current => {
      if (!current) {
        this.isMobileSearchVisible.set(false);
      }
      return !current;
    });
  }

  toggleSearch(): void {
    this.isMobileSearchVisible.update(current => {
      if (!current) {
        this.isMobileMenuOpen.set(false);
      } else {

        this.searchControl.setValue('');
        this.hideInput(true);
      }
      return !current;
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.isDesktop()) {
      if (this.isMobileMenuOpen()) {
        this.isMobileMenuOpen.set(false);
      }
      if (this.isMobileSearchVisible()) {
        this.isMobileSearchVisible.set(false);
      }
    }
    this.updateSearchPosition();
  }


  updateSearchPosition() {
    if (!this.isDesktop()) return;

    const inputEl = this.desktopSearchInput()?.nativeElement;
    if (inputEl) {
      const rect = inputEl.getBoundingClientRect();
      const newWidth = Math.min(650, rect.width);
      this.searchPosition.set({
        top: `${rect.bottom + 8}px`,
        left: `${rect.left}px`,
        width: `${newWidth}px`
      });
    }
  }

  showInput() {
    if (this.isDesktop()) {
        this.updateSearchPosition();
    }
  }

  submit(event: Event) {
    event.preventDefault();
    const term = this.searchControl.value;
    if (term.trim().length > 0) {
        this.router.navigate(['/search'], { queryParams: { q: term.trim() } });
    }
    this.hideInput(true);
  }

  hideInput(isNavigationClick = false) {
    if (isNavigationClick) {
      this.isVisible.set(false);
      this.desktopSearchInput()?.nativeElement.blur();
      this.isMobileSearchVisible.set(false);
      return;
    }

    setTimeout(() => {
      if (!this.mouseDownOnElement) {
        this.isVisible.set(false);
      }
      this.mouseDownOnElement = false;
    }, 150);
  }

  onMouseDown(event: MouseEvent) {
    this.mouseDownOnElement = true;
    event.preventDefault();
  }

}
