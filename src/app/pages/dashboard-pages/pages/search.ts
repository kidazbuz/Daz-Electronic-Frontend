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
          <div
              class="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 z-[110] overflow-hidden animate-fade-in"
              (mousedown)="onMouseDown($event)">

              <div class="flex flex-col max-h-[50vh] overflow-y-auto custom-scrollbar">
                  @for (item of foundItems(); track item.id) {
                      <a
                          [routerLink]="['/dashboard/catalog', item.id]"
                          (click)="hideInput(true)"
                          class="p-5 flex items-center hover:bg-primary/5 border-b border-gray-100 dark:border-slate-700 last:border-none no-underline transition-colors group"
                      >
                          <i class="pi pi-search mr-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity text-lg"></i>
                          <div class="flex flex-col">
                              <span class="font-semibold text-slate-700 dark:text-slate-200 text-base">
                                  {{ item.parent_product_name }}
                              </span>
                              <span class="text-xs text-slate-400 font-mono mt-0.5">Model: {{ item.model }}</span>
                          </div>
                      </a>
                  } @empty {
                      <div class="p-10 text-center">
                          <i class="pi pi-exclamation-circle text-3xl text-slate-300 mb-3 block"></i>
                          <div class="text-slate-500 italic text-lg">
                              No matches for "<span class="font-semibold text-primary">{{ searchControl.value }}</span>"
                          </div>
                      </div>
                  }
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
