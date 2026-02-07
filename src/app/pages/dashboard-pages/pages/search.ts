import { Component, signal, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { Master } from '../../../shared/services/master';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [ReactiveFormsModule, RouterModule],
    template: ` <div class="relative w-full max-w-3xl mx-auto mt-2">

      <div class="relative w-full group">
          <i class="pi pi-search absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-60 text-xl"></i>

          <input
              [formControl]="searchControl"
              type="text"
              placeholder="Search products..."
              class="w-full pl-14 pr-6 py-4 rounded-xl border outline-none transition-all shadow-md focus:ring-4 focus:ring-primary/10 text-lg"
              style="
                  background-color: var(--surface-ground);
                  color: var(--text-color);
                  border-color: var(--surface-border);
              "
          >
      </div>

      @if (isVisible() && !isLoading()) {
        <div class="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 z-[110] overflow-hidden animate-fade-in">

            <div class="flex flex-col max-h-[60vh] overflow-y-auto custom-scrollbar">
                @for (product of foundItems(); track product.id) {

                    @for (spec of product.specifications; track spec.id) {
                        <a [routerLink]="['/dashboard/catalog', spec.id]"
                           (click)="hideInput(true)"
                           class="p-4 flex items-center hover:bg-blue-50/50 dark:hover:bg-blue-900/10 border-b border-gray-50 dark:border-slate-700/50 no-underline transition-all group">

                            <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                <i class="pi pi-desktop text-blue-600 dark:text-blue-400"></i>
                            </div>

                            <div class="flex flex-col flex-1">
                                <div class="flex justify-between items-start">
                                    <span class="font-bold text-slate-700 dark:text-slate-200 text-sm">
                                        {{ product.name }}
                                    </span>
                                    <span class="text-[10px] font-black uppercase tracking-tighter text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">Hardware</span>
                                </div>
                                <span class="text-xs text-slate-400 font-mono">Model: {{ spec.model }}</span>
                            </div>
                        </a>
                    }

                    @for (fw of product.firmwares; track fw.id) {
                        <a [routerLink]="['/dashboard/firmware', fw.id]"
                           (click)="hideInput(true)"
                           class="p-4 flex items-center hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 border-b border-gray-50 dark:border-slate-700/50 no-underline transition-all group">

                            <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                <i class="pi pi-file-export text-emerald-600 dark:text-emerald-400"></i>
                            </div>

                            <div class="flex flex-col flex-1">
                                <div class="flex justify-between items-start">
                                    <span class="font-bold text-slate-700 dark:text-slate-200 text-sm">
                                        {{ fw.board_number }}
                                    </span>
                                    <span class="text-[10px] font-black uppercase tracking-tighter text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded">Firmware</span>
                                </div>
                                <span class="text-xs text-slate-400 font-mono">{{ fw.software_type_display }} • {{ fw.panel_model || 'Universal' }}</span>
                            </div>
                        </a>
                    }

                } @empty {
                    <div class="p-10 text-center">
                        <div class="w-16 h-16 bg-slate-50 dark:bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="pi pi-search-plus text-2xl text-slate-300"></i>
                        </div>
                        <div class="text-slate-500 italic text-base">
                            No hardware or firmware matches for
                            <span class="block font-bold text-primary not-italic mt-1">"{{ searchControl.value }}"</span>
                        </div>
                    </div>
                }
            </div>

            <div class="bg-slate-50 dark:bg-slate-900/50 p-3 px-5 border-t border-gray-100 dark:border-slate-700">
                 <p class="text-[10px] text-slate-400 m-0">
                    <i class="pi pi-info-circle mr-1"></i>
                    Searching by Board Number, Model, or Panel Model...
                 </p>
            </div>
        </div>
    }
    </div>`
})
export class Search {

  searchControl = new FormControl('', { nonNullable: true });
  private searchService = inject(Master);
  isVisible = signal(false);
  private mouseDownOnElement = false;
  isLoading = signal(false);

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

  hideInput(isNavigationClick = false) {
    if (isNavigationClick) {
      this.isVisible.set(false);
      // this.desktopSearchInput()?.nativeElement.blur();
      // this.isMobileSearchVisible.set(false);
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
