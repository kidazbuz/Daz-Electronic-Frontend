import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Search } from './search';

@Component({
    selector: 'app-catalog-main',
    imports: [RouterModule, Search],
    standalone: true,
    template: `
    <div class="card overflow-visible"> <div class="sticky top-0 z-[110] -mx-6 -mt-8 p-6 mb-4 rounded-t-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800">
            <div class="font-semibold text-xl mb-12"></div>

            <app-search />
        </div>

        <div class="mt-2">
          <router-outlet></router-outlet>
        </div>
    </div>`
})
export class CatalogMain {}
