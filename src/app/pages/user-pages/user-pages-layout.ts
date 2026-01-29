import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { Copyright } from './copyright';

@Component({
    selector: 'app-user-pages-layout',
    imports: [AppFloatingConfigurator, RouterModule, Copyright],
    standalone: true,
    template: `
          <app-floating-configurator />
          <div class="flex items-center justify-center min-h-screen overflow-hidden">
              <div class="flex flex-col items-center justify-center">

                  <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, color-mix(in srgb, var(--primary-color), transparent 60%) 10%, var(--surface-ground) 30%)">
                      <div class="w-full bg-surface-0 dark:bg-surface-900 py-8 px-4 sm:px-10 flex flex-col items-center" style="border-radius: 53px">
                          <router-outlet></router-outlet>
                      </div>
                  </div>
              </div>
          </div>
          <app-copyright />
          `
})
export class UserPagesLayout implements OnInit {

  ngOnInit(): void {

  }

}
