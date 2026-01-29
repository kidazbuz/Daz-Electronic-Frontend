import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { ImageModule } from 'primeng/image';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { IProductSpecification, IPaginatedSpecificationList } from '../../../shared/interfaces/product';
import { Master } from '../../../shared/services/master';

@Component({
    selector: 'app-latest',
    imports: [DividerModule, ButtonModule, RippleModule, CommonModule, FormsModule, TagModule, CarouselModule],
    template: `
        <div class="text-center mb-4">
            <div class="text-surface-900 dark:text-surface-0 font-normal mb-2 text-4xl">Latest Products</div>
            <span class="text-muted-color text-2xl">The Newest Products</span>
        </div>
          <p-carousel [value]="products" [numVisible]="3" [numScroll]="3" [circular]="false" [responsiveOptions]="carouselResponsiveOptions">
              <ng-template let-product #item>
                  <div class="border border-surface rounded-border m-2 p-4">
                      <div class="mb-4">
                          <div class="relative mx-auto">
                              <img src="https://primefaces.org/cdn/primeng/images/demo/product/{{ product.image }}" [alt]="product.name" class="w-full rounded-border" />
                              <div class="absolute bg-black/70 rounded-border" [ngStyle]="{ 'left.px': 5, 'top.px': 5 }">
                                  <p-tag [value]="product.inventoryStatus" [severity]="getSeverity(product.inventoryStatus)" />
                              </div>
                          </div>
                      </div>
                      <div class="mb-4 font-medium">{{ product.name }}</div>
                      <div class="flex justify-between items-center">
                          <div class="mt-0 font-semibold text-xl">{{ '$' + product.price }}</div>
                          <span>
                              <p-button icon="pi pi-heart" severity="secondary" [outlined]="true" />
                              <p-button icon="pi pi-shopping-cart" styleClass="ml-2" />
                          </span>
                      </div>
                  </div>
              </ng-template>
          </p-carousel>
    `
})
export class Latest implements OnInit {

  products!: IProductSpecification[];

  carouselResponsiveOptions: any[] = [
      {
          breakpoint: '1024px',
          numVisible: 3,
          numScroll: 3
      },
      {
          breakpoint: '768px',
          numVisible: 2,
          numScroll: 2
      },
      {
          breakpoint: '560px',
          numVisible: 1,
          numScroll: 1
      }
  ];

  constructor(
      private productService: Master,
  ) {}

  ngOnInit() {
      this.productService.getProducts().subscribe((products: IProductSpecification[]) => {
          this.products = products;
      });
  }

  getSeverity(status: string) {
      switch (status) {
          case 'INSTOCK':
              return 'success';
          case 'LOWSTOCK':
              return 'warn';
          case 'OUTOFSTOCK':
              return 'danger';
          default:
              return 'success';
      }
  }

}
