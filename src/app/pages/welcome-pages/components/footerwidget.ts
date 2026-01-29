import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'footer-widget',
    imports: [RouterModule],
    template: `
        <div class="py-12 px-12 mx-0 mt-20 lg:mx-20 border-t border-surface-200 dark:border-surface-700">
          <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 md:col-span-3">
                  <a (click)="router.navigate(['/'], { fragment: 'home' })" class="flex flex-wrap items-center justify-center md:justify-start md:mb-0 mb-6 cursor-pointer">
                      <h4 class="font-bold text-3xl text-primary mb-2">Daz Electronics</h4>
                  </a>
                  <p class="text-surface-600 dark:text-surface-200 text-center md:text-left mb-4">Quality Electronics, Guaranteed.</p>

                  <div class="flex items-center justify-center md:justify-start gap-3">
                      <a href="#" class="p-2 border-circle bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-100 hover:text-primary transition-colors duration-200">
                          <i class="pi pi-facebook text-xl"></i>
                      </a>
                      <a href="#" class="p-2 border-circle bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-100 hover:text-primary transition-colors duration-200">
                          <i class="pi pi-twitter text-xl"></i>
                      </a>
                      <a href="#" class="p-2 border-circle bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-100 hover:text-primary transition-colors duration-200">
                          <i class="pi pi-instagram text-xl"></i>
                      </a>
                      <a href="https://wa.me/yourphonenumber" class="p-2 border-circle bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-100 hover:text-primary transition-colors duration-200">
                          <i class="pi pi-whatsapp text-xl"></i>
                      </a>
                  </div>
              </div>

              <div class="col-span-12 md:col-span-9">
                  <div class="grid grid-cols-12 gap-8 text-center md:text-left">
                      <div class="col-span-12 md:col-span-4">
                          <h4 class="font-medium text-2xl leading-normal mb-6 text-surface-900 dark:text-surface-0">Company</h4>
                          <a [routerLink]="['/der/about']" class="leading-normal text-xl block cursor-pointer mb-2 text-surface-700 dark:text-surface-100 hover:text-primary">About Us</a>
                          <a [routerLink]="['/der/location']" class="leading-normal text-xl block cursor-pointer mb-2 text-surface-700 dark:text-surface-100 hover:text-primary">Location</a>
                      </div>

                      <div class="col-span-12 md:col-span-4">
                          <h4 class="font-medium text-2xl leading-normal mb-6 text-surface-900 dark:text-surface-0">Support</h4>
                          <a [routerLink]="['/der/contact']" class="leading-normal text-xl block cursor-pointer mb-2 text-surface-700 dark:text-surface-100 hover:text-primary">Contact Us</a>
                          <a [routerLink]="['/der/return']" class="leading-normal text-xl block cursor-pointer mb-2 text-surface-700 dark:text-surface-100 hover:text-primary">Returns</a>
                      </div>

                      <div class="col-span-12 md:col-span-4">
                          <h4 class="font-medium text-2xl leading-normal mb-6 text-surface-900 dark:text-surface-0">Legal</h4>
                          <a [routerLink]="['/der/policy']" class="leading-normal text-xl block cursor-pointer mb-2 text-surface-700 dark:text-surface-100 hover:text-primary">Privacy Policy</a>
                          <a [routerLink]="['/der/service']" class="leading-normal text-xl block cursor-pointer mb-2 text-surface-700 dark:text-surface-100 hover:text-primary">Terms of Service</a>
                      </div>
                  </div>
              </div>
          </div>

      <div class="border-t border-surface-200 dark:border-surface-700 mt-8 pt-8 text-center text-surface-600 dark:text-surface-400">
          &copy; {{ currentYear }} Daz Electronics. All rights reserved.
      </div>
    </div>
    `
})
export class FooterWidget {

    constructor(public router: Router) {}

    currentYear: number = new Date().getFullYear();

}
