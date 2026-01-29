import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';

@Component({
    selector: 'app-copyright',
    imports: [],
    standalone: true,
    template: `
          <div class="text-center mt-6">
              <p class="text-surface-600 dark:text-surface-400 text-sm">
                  © {{ copyright }}. All rights reserved.
              </p>
          </div>`
})
export class Copyright implements OnInit {

  public brand = "Daz Electronics";
  readonly currentYear: number = new Date().getFullYear();
  public copyright: string = '';

  ngOnInit(): void {
    this.get_copyright_name();
  }

  get_copyright_name(){
    this.copyright = `${this.brand} ${this.currentYear}`;
    return this.copyright;
  }

}
