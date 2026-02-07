import { Component, OnInit, OnDestroy, AfterViewInit, signal } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { EMPTY, Subscription } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IFirmwareProduct, ISoftProductRecommendation } from '../../../shared/interfaces/product';
import { Master } from '../../../shared/services/master';
import { Cart } from '../../../shared/services/cart';
import { Message } from '../../../shared/services/message';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { GalleriaModule } from 'primeng/galleria';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { AccordionModule } from 'primeng/accordion';
import { FieldsetModule } from 'primeng/fieldset';
import { ImageModule } from 'primeng/image';
import { Auth } from '../../../shared/services/auth';

declare const Drift: any;
declare const GLightbox: any;
declare const AOS: any;

@Component({
  selector: 'app-software-specific',
  standalone: true,
  imports: [
    FormsModule, ImageModule, FieldsetModule, AccordionModule,
    DialogModule, TabsModule, CommonModule, ToastModule,
    GalleriaModule, SkeletonModule, TagModule, ButtonModule
  ],
  template: `

  <p-toast></p-toast>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 transition-colors duration-500" *ngIf="product">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">

      <div class="space-y-6">
          <div class="relative overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40 dark:shadow-none">
              <p-galleria
                  [value]="galleriaImages"
                  [responsiveOptions]="galleriaResponsiveOptions"
                  [containerStyle]="{ 'width': '100%' }"
                  [numVisible]="5"
                  [circular]="true"
                  [showItemNavigators]="true"
                  styleClass="custom-product-galleria">

                  <ng-template #item let-item>
                      <div class="main-image-container relative w-full flex justify-center p-6 md:p-12 bg-white dark:bg-slate-900">
                          <p-image
                              [src]="item.itemImageSrc"
                              [alt]="item.alt"
                              [preview]="true"
                              appendTo="body"
                              width="100%"
                              imageClass="w-full h-auto object-contain max-h-[350px] md:max-h-[450px] hover:scale-105 transition-transform duration-1000 cursor-zoom-in">
                          </p-image>
                      </div>
                  </ng-template>

                  <ng-template #thumbnail let-item>
                      <div class="p-2">
                          <div class="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all duration-300">
                              <img [src]="item.thumbnailImageSrc" class="w-full h-full object-cover" />
                          </div>
                      </div>
                  </ng-template>
              </p-galleria>

              <div class="absolute top-6 left-6" *ngIf="product.software_type_display">
                  <span class="bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg shadow-lg">
                      {{ product.software_type_display }}
                  </span>
              </div>
          </div>

          <div class="grid grid-cols-2 gap-3 items-center">
              <div class="flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100/50 dark:border-slate-800">
                  <button (click)="openFullView(product!)" class="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 group">
                      <i class="pi pi-external-link text-[10px]"></i>
                      <span>Click to see full view</span>
                  </button>
              </div>
              <div class="flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100/50 dark:border-slate-800">
                  <button (click)="showReviews()" class="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 group">
                      <i class="pi pi-external-link text-[10px]"></i>
                      <span>Click to see Reviews</span>
                  </button>
              </div>
          </div>
      </div>

      <div class="flex flex-col py-2">
          <div class="flex justify-between items-center mb-6">
              <span class="text-[9px] font-black tracking-[0.4em] text-blue-600 dark:text-blue-400 uppercase">FIRMWARE / SOFTWARE</span>
              <div class="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400">
                  <i class="pi pi-star-fill text-amber-400"></i>
                  {{ averageRating }} <span class="mx-1 opacity-20">|</span> {{ totalReviews }} Reviews
              </div>
          </div>

          <div class="font-semibold text-xl mb-4">{{ product.name }}</div>
          <span class="text-sm font-bold text-slate-400 mb-8 block">Board: {{ product.board_number }}</span>

          <div class="flex items-center gap-4 mb-8">
              <span class="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {{ product.price | currency: 'TZS ': 'symbol':'1.0-0' }}
              </span>
          </div>

          <div class="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/30 mb-8">
              <span class="block text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Compatible Panel</span>
              <p class="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic">
                  {{ product.panel_model || 'Universal Compatibility' }}
              </p>
          </div>

          <div class="p-4 rounded-xl border flex items-center justify-between mb-10 bg-emerald-500/5 border-emerald-500/20">
              <div class="flex items-center gap-2">
                  <div class="bg-emerald-500 w-1.5 h-1.5 rounded-full"></div>
                  <span class="text-[10px] font-black uppercase tracking-widest text-emerald-600">Digital Delivery</span>
              </div>
              <span class="text-[10px] font-bold text-slate-400">Instant Access</span>
          </div>

          <div class="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div class="flex gap-4">
                  <div class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                      <button (click)="quantity = quantity > 1 ? quantity - 1 : 1" class="w-10 h-10 flex justify-center items-center text-slate-400 transition-colors">
                          <i class="pi pi-minus text-[10px]"></i>
                      </button>
                      <input type="number" [(ngModel)]="quantity" class="w-8 bg-transparent text-center font-black text-xs outline-none" readonly>
                      <button (click)="quantity = quantity + 1" class="w-10 h-10 flex justify-center items-center text-slate-400 transition-colors">
                          <i class="pi pi-plus text-[10px]"></i>
                      </button>
                  </div>

                  <button (click)="addToCart()" class="flex-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 active:scale-95 transition-all">
                      <i class="pi pi-shopping-bag"></i> Add to Cart
                  </button>
              </div>

              <button (click)="redirectToNotAvailable()" class="w-full h-14 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[11px] hover:opacity-90 active:scale-[0.98] transition-all shadow-2xl shadow-blue-500/20">
                  Buy Now
              </button>

              <div class="mt-6">
                  <p-fieldset legend="Description" [toggleable]="true">
                      <p class="m-0 text-sm leading-relaxed">{{ product.description }}</p>
                  </p-fieldset>
              </div>
          </div>
      </div>
  </div>

  <div class="mb-5 mt-8 px-5">
      <p-tabs value="0">
          <p-tablist>
              <p-tab value="0">Installation Overview</p-tab>
              <p-tab value="1">Technical Specs</p-tab>
              <p-tab value="2">Reviews</p-tab>
          </p-tablist>

          <p-tabpanels>
              <p-tabpanel value="0">
                  <div class="font-semibold text-xl mb-4">About this Firmware</div>
                  <p class="text-sm text-slate-600 dark:text-slate-400 mb-6">
                      This is a verified firmware for <strong>{{ product.board_number }}</strong>.
                      Ensure your panel model matches <strong>{{ product.panel_model }}</strong> before installation.
                  </p>
                  <div class="p-4 bg-surface-50 dark:bg-surface-900 rounded-xl border border-surface-200">
                      <ul class="list-none p-0 m-0 space-y-3 text-sm">
                          <li class="flex items-center gap-2"><i class="pi pi-file-export text-blue-500"></i> <strong>File Type:</strong> {{ product.software_type_display }}</li>
                          <li class="flex items-center gap-2"><i class="pi pi-database text-blue-500"></i> <strong>Size:</strong> {{ product.size_mb }} MB</li>
                      </ul>
                  </div>
              </p-tabpanel>

              <p-tabpanel value="1">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-10 p-4">
                      <div>
                          <h5 class="mb-4 text-lg font-bold">Software Identity</h5>
                          <div class="overflow-hidden rounded-lg border border-slate-100 dark:border-slate-800">
                              <table class="w-full text-sm">
                                  <tr class="border-b border-slate-100 dark:border-slate-800">
                                      <td class="py-3 font-bold bg-slate-50 dark:bg-slate-800/50 px-4">Board Number</td>
                                      <td class="py-3 px-4">{{ product.board_number }}</td>
                                  </tr>
                                  <tr class="border-b border-slate-100 dark:border-slate-800">
                                      <td class="py-3 font-bold bg-slate-50 dark:bg-slate-800/50 px-4">Panel Model</td>
                                      <td class="py-3 px-4">{{ product.panel_model }}</td>
                                  </tr>
                                  <tr>
                                      <td class="py-3 font-bold bg-slate-50 dark:bg-slate-800/50 px-4">Version</td>
                                      <td class="py-3 px-4">{{ product.version || 'Latest' }}</td>
                                  </tr>
                              </table>
                          </div>
                      </div>
                  </div>
              </p-tabpanel>

              <p-tabpanel value="2">
                  <div class="p-4 max-w-4xl">
                    <h5 class="mb-6 text-xl font-bold dark:text-white">User Verification & Feedback</h5>

                    @if ((product.user_reviews?.length ?? 0) === 0) {
                      <div class="flex flex-col items-center py-10 text-slate-400">
                        <div class="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                          <i class="pi pi-comments text-3xl opacity-50"></i>
                        </div>
                        <p class="font-medium">No reviews yet.</p>
                        <p class="text-sm">Be the first to confirm if this firmware build works!</p>
                      </div>
                    } @else {
                      @for (review of product.user_reviews; track review.id) {
                        <div class="mb-8 pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0">
                          <div class="flex items-center gap-3 mb-3">
                            <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-bold text-primary overflow-hidden border border-slate-200 dark:border-slate-800">
                              @if (review.profile_picture) {
                                <img [src]="review.profile_picture" [alt]="review.user" class="w-full h-full object-cover" />
                              } @else {
                                {{ review.user?.charAt(0) || 'U' }}
                              }
                            </div>
                            <div class="flex flex-col">
                              <span class="font-bold text-sm dark:text-slate-200">{{ review.user }}</span>
                              <span class="text-xs text-slate-400">{{ review.created_at | date:'medium' }}</span>
                            </div>
                          </div>

                          <div class="flex text-orange-400 text-xs mb-3">
                            @for (star of [1,2,3,4,5]; track $index) {
                              <i [class]="star <= review.rating ? 'pi pi-star-fill' : 'pi pi-star'" class="mr-1"></i>
                            }
                          </div>

                          <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed m-0 italic bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                            "{{ review.comment }}"
                          </p>
                        </div>
                      }
                    }
                  </div>
                </p-tabpanel>

              </p-tabpanels>
      </p-tabs>
  </div>

  </div>

  <p-dialog *ngIf="product"
          [(visible)]="showMediaDialog"
          [modal]="true"
          [draggable]="false"
          [resizable]="false"
          [showHeader]="true"
          maskStyleClass="backdrop-blur-md bg-slate-900/40"
          styleClass="!w-[95vw] !max-w-[1200px] !rounded-[2.5rem] !overflow-hidden !border-none !shadow-2xl">

  <p-tabs value="0">
    <p-tablist>
      <p-tab value="0" class="uppercase tracking-widest text-xs font-bold">Product Shots</p-tab>
      <p-tab value="1" class="uppercase tracking-widest text-xs font-bold">Video Guides</p-tab>
    </p-tablist>

    <p-tabpanels>
      <p-tabpanel value="0">
        <div *ngIf="product.images && product.images.length > 0; else noImages"
             class="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 bg-white dark:bg-slate-900 transition-colors duration-300">

          <div class="lg:col-span-9 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] overflow-hidden flex items-center justify-center min-h-[350px] md:min-h-[550px] border border-slate-100 dark:border-slate-800 shadow-inner">
            <p-image
                [src]="selectedGalleryImage ?? product.images[0].image"
                [alt]="product.name"
                [preview]="true"
                appendTo="body"
                imageClass="max-w-[90%] max-h-[500px] object-contain transition-all duration-700 hover:scale-105 cursor-zoom-in">
            </p-image>
          </div>

          <div class="lg:col-span-3 flex flex-col">
            <h3 class="text-[9px] font-black uppercase text-slate-400 mb-4 tracking-[0.2em] px-1">
              File Gallery ({{ product.images.length }})
            </h3>
            <div class="grid grid-cols-4 lg:grid-cols-2 gap-3 overflow-y-auto lg:max-h-[500px] pr-2 scrollbar-hide">
              <div *ngFor="let img of product.images"
                   (click)="selectedGalleryImage = img.image"
                   [ngClass]="(selectedGalleryImage === img.image || (!selectedGalleryImage && product.images[0] === img)) ? 'ring-2 ring-blue-600 scale-95 shadow-lg' : 'opacity-70 hover:opacity-100'"
                   class="aspect-square rounded-2xl bg-white dark:bg-slate-800 p-1 cursor-pointer transition-all duration-300 border border-slate-100 dark:border-slate-700 overflow-hidden">
                <img [src]="img.image" class="w-full h-full object-cover rounded-xl">
              </div>
            </div>
          </div>
        </div>

        <ng-template #noImages>
          <div class="flex flex-col items-center justify-center py-24 text-center">
            <div class="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <i class="pi pi-image text-slate-300 dark:text-slate-600 text-4xl"></i>
            </div>
            <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">Technical Preview Unavailable</h3>
            <p class="text-slate-500 max-w-xs">We haven't uploaded interface screenshots for this firmware version yet.</p>
          </div>
        </ng-template>
      </p-tabpanel>

      <p-tabpanel value="1">
        <div *ngIf="product?.videos && product.videos.length > 0; else noVideos"
             class="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 bg-white dark:bg-slate-900 transition-colors duration-300">

          <div class="lg:col-span-8 bg-black rounded-[2rem] overflow-hidden aspect-video flex items-center justify-center shadow-2xl border border-slate-800">
            <video #videoPlayer
                   [src]="activeVideo?.video ?? product.videos[0].video"
                   controls
                   class="w-full h-full">
            </video>
          </div>

          <div class="lg:col-span-4 flex flex-col">
            <h3 class="text-[9px] font-black uppercase text-slate-400 mb-4 tracking-[0.2em] px-1">Installation Tutorials</h3>
            <div class="flex flex-col gap-3 overflow-y-auto lg:max-h-[450px] pr-2 scrollbar-thin">
              <div *ngFor="let video of product?.videos"
                   (click)="activeVideo = video"
                   class="flex gap-4 p-3 rounded-2xl cursor-pointer transition-all border border-transparent group"
                   [ngClass]="(activeVideo?.id === video.id || (!activeVideo && product.videos[0] === video)) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/40 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-slate-800'">

                <div class="relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <i class="pi pi-video text-slate-400 text-xl group-hover:scale-110 transition-transform"></i>
                  <div class="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/0 transition-colors">
                    <i class="pi pi-play-circle text-white text-xl shadow-xl"></i>
                  </div>
                </div>

                <div class="flex flex-col justify-center gap-1">
                  <span class="text-[11px] font-black text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                    Tutorial: Setup Guide #{{ video.id }}
                  </span>
                  <span class="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">Play Video</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ng-template #noVideos>
          <div class="flex flex-col items-center justify-center py-24 text-center">
            <div class="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <i class="pi pi-video text-slate-300 dark:text-slate-600 text-4xl"></i>
            </div>
            <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">No Video Documentation</h3>
            <p class="text-slate-500 max-w-xs">There are no video setup guides currently available for this software.</p>
          </div>
        </ng-template>
      </p-tabpanel>
    </p-tabpanels>
  </p-tabs>
</p-dialog>

<p-dialog *ngIf="product"
  header="Developer & User Feedback"
  [(visible)]="displayReviews"
  [modal]="true"
  [breakpoints]="{ '960px': '75vw', '641px': '90vw' }"
  [style]="{ width: '50vw' }"
  [draggable]="false"
  [resizable]="false"
  styleClass="dark:bg-slate-900 !rounded-[2rem] overflow-hidden"
  maskStyleClass="backdrop-blur-sm">

  <div class="p-4 max-w-4xl">
    @if (!product.user_reviews || product.user_reviews.length === 0) {
        <div class="flex flex-col items-center py-10 text-slate-400">
            <i class="pi pi-comments text-4xl mb-2"></i>
            <p>No feedback yet. Be the first to verify this build!</p>
        </div>
    } @else {
        @for (review of product.user_reviews; track review.id) {
            <div class="mb-8 pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-bold text-primary overflow-hidden border border-slate-200 dark:border-slate-800">
                      @if (review.profile_picture) {
                          <img [src]="review.profile_picture" [alt]="review.user" class="w-full h-full object-cover" />
                      } @else {
                          {{ review.user.charAt(0) }}
                      }
                    </div>
                    <div class="flex flex-col">
                        <span class="font-bold text-sm">{{ review.user }}</span>
                        <span class="text-xs text-slate-400">{{ review.created_at | date:'longDate' }}</span>
                    </div>
                </div>

                <div class="flex text-amber-400 text-[10px] mb-3">
                    @for (star of [1,2,3,4,5]; track $index) {
                        <i [class]="star <= review.rating ? 'pi pi-star-fill' : 'pi pi-star'" class="mr-1"></i>
                    }
                </div>

                <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed m-0 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                    "{{ review.comment }}"
                </p>
            </div>
        }
    }
  </div>
</p-dialog>


  `,
})
export class Soft implements OnInit, AfterViewInit, OnDestroy {

  product: IFirmwareProduct | undefined;
  relatedProducts: ISoftProductRecommendation[] = [];

  isRecsLoading: boolean = false;
  isLoading = true;
  displayReviews: boolean = false;
  error: string | null = null;
  private routeSub: Subscription | undefined;

  showMediaDialog: boolean = false;
  isAuthenticated = signal<boolean>(false);

  selectedGalleryImage: string | undefined;
  activeVideo: any | undefined;

  quantity: number = 1;
  selectedVersion: string = '';

  galleriaImages: any[] = [];
  galleriaResponsiveOptions: any[] = [
    { breakpoint: '1024px', numVisible: 5 },
    { breakpoint: '768px', numVisible: 3 },
    { breakpoint: '560px', numVisible: 1 }
  ];

  private driftZoom: any;
  private gallery: any;
  mainImageUrl: string = '';
  public Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: Auth,
    private productService: Master,
    private cartService: Cart,
    private notify: Message
  ) { }

  ngOnInit(): void {
    this.ckeckUserAuthStatus();

    this.routeSub = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.isLoading = true;
          window.scrollTo({ top: 0, behavior: 'smooth' });

          return this.productService.getSoftwareById(id);
        }
        return EMPTY;
      })
    ).subscribe({
      next: (data: IFirmwareProduct) => {
        this.product = data;
        this.isLoading = false;

        if (this.product.id) {

          this.loadRecommendations(this.product.id);
        }

        if (this.product.images && this.product.images.length > 0) {
          this.galleriaImages = this.product.images.map(img => ({
            itemImageSrc: img.image,
            thumbnailImageSrc: img.image,
            alt: this.product?.name
          }));
          this.mainImageUrl = this.product.images[0].image;
        }

        this.setupImageLibraries();

        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 800, once: true });
          AOS.refresh();
        }
      },
      error: (err) => {
        this.notify.error('Software not found.', 'Error');
        this.isLoading = false;
      }
    });
  }

  ckeckUserAuthStatus() {
    this.isAuthenticated.set(!!this.authService.getAuthenticatedUser());
  }

  loadRecommendations(id: string) {
    this.isRecsLoading = true;
    this.productService.getSimilarSoftware(id).subscribe({
      next: (recData: ISoftProductRecommendation[]) => {
        this.relatedProducts = recData;
        this.isRecsLoading = false;
      },
      error: (err: any) => {
        this.relatedProducts = [];
        this.isRecsLoading = false;
      }
    });
  }

  addToCart(): void {
    if (this.product && this.quantity > 0) {
      this.cartService.addItem(
        this.product as any, // Cast if cart expects IProductSpecification
        this.quantity,
        this.product.board_number, // Pass Board Number instead of Color
        'Digital' // Pass Digital instead of Size
      );

      this.notify.success(`${this.product.name} added to cart!`, 'Success');
    }
  }

  // ... setupImageLibraries, openFullView, etc. remain identical ...
  ngAfterViewInit(): void {
    if (this.product) { this.setupImageLibraries(); }
    if (typeof AOS !== 'undefined') { AOS.refresh(); }
  }

  setupImageLibraries(): void {
    if (this.driftZoom) { this.driftZoom.destroy(); }
    const mainImageElement = document.getElementById('main-product-image');
    if (mainImageElement) {
      this.driftZoom = new Drift(mainImageElement, {
        paneContainer: mainImageElement.parentElement,
        inlinePane: 900,
        zoomFactor: 3
      });
    }

    if (this.gallery) { this.gallery.destroy(); }
    this.gallery = GLightbox({
      selector: '.glightbox-item',
      touchNavigation: true,
      loop: true
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
    if (this.driftZoom) this.driftZoom.destroy();
    if (this.gallery) this.gallery.destroy();
  }

  openFullView(product: IFirmwareProduct) {

    if (!product) return;

    if (product.images && product.images.length > 0) {
      this.selectedGalleryImage = product.images[0].image;
    }

    if (product.videos && product.videos.length > 0) {
      this.activeVideo = product.videos[0];
    }

    this.showMediaDialog = true;
  }

  showReviews() {
    this.displayReviews = true;
  }

  get totalReviews(): number {
    return this.product?.user_reviews?.length || 0;
  }

  get averageRating(): number {
    if (!this.product || !this.product.user_reviews || this.product.user_reviews.length === 0) {
      return 0;
    }
    const sum = this.product.user_reviews.reduce((acc, review) => acc + review.rating, 0);
    return parseFloat((sum / this.product.user_reviews.length).toFixed(1));
  }

  redirectToNotAvailable(){
    return this.router.navigate(['/notavailable']);
  }
}
