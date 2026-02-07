import {
    Directive,
    signal,
    inject,
    HostListener,
    OnDestroy,
    OnInit
} from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { finalize, throttleTime, fromEvent, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { IProductSpecification, IPaginatedSpecificationList,  } from '../../../shared/interfaces/product';
import { Slide, NavLink } from '../../../shared/interfaces/home';
import { Master } from '../../../shared/services/master';

@Directive()
export abstract class BaseProductList implements OnInit, OnDestroy {

    public API_BASE_URL = "http://127.0.0.1:8000/api/";

    protected http = inject(HttpClient);
    public router = inject(Router);
    protected productService = inject(Master);

    private slideInterval: any;
    currentYear: number = new Date().getFullYear();

    public initialUrl = `${this.API_BASE_URL}products/public-catalog/`

    // INFINITE SCROLLING STATE
    nextPageUrl: string | null = this.initialUrl;
    protected loadedIds = new Set<number>();
    isLoading = signal(false);
    products: IProductSpecification[] = [];
    private scrollSubscription?: Subscription;

    protected activeQueryParams: any = {};

    // UI/NAV STATE
    readonly navLinks: NavLink[] = [
        { label: 'TV Screens', link: '/der/screens' },
        { label: 'Motherboards', link: '/der/motherboards' },
        { label: 'T-Con', link: '/der/t-con' },
        { label: 'Accessories', link: '/der/accessories' },
        { label: 'Software', link: '/der/software' },
        { label: 'Deals', link: '/der/deals' },
        { label: 'Support', link: '/support' },
        { label: 'Sign in', link: '/der/account/login' },
        { label: 'Cart', link: '/cart' },
    ];
    mainNavLinks: NavLink[] = [];
    mobileNavLinks: NavLink[] = [];
    isMobileMenuOpen = signal(false);

    // SLIDESHOW STATE
    slides = signal<Slide[]>([
        { title: 'The Future of Sound', subtitle: 'New Audio Series - Up to 40% Off.', cta: 'Shop Now', link: '/sale/audio', imgClass: 'slide-1' },
        { title: 'Big Screen, Bigger Deals', subtitle: '4K QLED TVs starting at $499.', cta: 'Explore TVs', link: '/shop/tvs', imgClass: 'slide-2' },
        { title: 'Smart Home Essentials', subtitle: 'Control your life with our automation kits.', cta: 'See Kits', link: '/shop/smarthome', imgClass: 'slide-3' },
    ]);
    currentSlide = signal(0);

    ngOnInit(): void {
        this.setupThrottledScroll(); // 5. Initialize the scroll listener
    }

    private setupThrottledScroll(): void {
        this.scrollSubscription = fromEvent(window, 'scroll')
            .pipe(
                throttleTime(500, undefined, { leading: true, trailing: true })
            )
            .subscribe(() => {
                this.onScroll();
            });
    }

    ngOnDestroy() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
        }
        this.scrollSubscription?.unsubscribe();
    }

    protected resetAndSetCategoryUrl(categoryPath: string | null): void {

        this.products = [];
        this.loadedIds.clear();
        this.isLoading.set(false);

        const params = new URLSearchParams();

        if (categoryPath && categoryPath !== 'home' && categoryPath !== 'der') {
            params.append('category_slug', categoryPath.toLowerCase());
        }

        if (this.activeQueryParams) {
            Object.keys(this.activeQueryParams).forEach(key => {
                const value = this.activeQueryParams[key];
                if (value !== undefined && value !== null && value !== '' && key !== 'category_slug') {
                    params.append(key, value.toString());
                }
            });
        }

        const queryString = params.toString();
        this.nextPageUrl = queryString ? `${this.initialUrl}?${queryString}` : this.initialUrl;

        console.log('Backend Request URL:', this.nextPageUrl);
    }

    loadNextPage(): void {
        if (this.isLoading() || !this.nextPageUrl) {
            return;
        }

        this.isLoading.set(true);

        this.http.get<IPaginatedSpecificationList>(this.nextPageUrl)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe(res => {
                const incomingResults = res.results;
                const newProducts: IProductSpecification[] = [];

                for (const item of incomingResults) {
                    if (!this.loadedIds.has(item.id)) {
                        newProducts.push(item);
                        this.loadedIds.add(item.id);
                    }
                }

                this.products = [...this.products, ...newProducts];
                this.nextPageUrl = res.next;
            });
    }


    onScroll(): void {
        if (this.isLoading() || !this.nextPageUrl) return;

        const SCROLL_THRESHOLD = 1000;
        const currentScrollPosition = window.scrollY + window.innerHeight;
        const totalDocumentHeight = document.documentElement.scrollHeight;

        if (currentScrollPosition >= totalDocumentHeight - SCROLL_THRESHOLD) {
            console.log('Threshold met - triggering next page load');
            this.loadNextPage();
        }
    }

    startSlideshow(): void {
        this.slideInterval = setInterval(() => { this.nextSlide(); }, 5000);
    }

    resetSlideshowTimer(): void {
        clearInterval(this.slideInterval);
        this.startSlideshow();
    }
    nextSlide(): void {
        this.currentSlide.update(current => (current + 1) % this.slides().length);
        this.resetSlideshowTimer();
    }
    prevSlide(): void {
        this.currentSlide.update(current => (current - 1 + this.slides().length) % this.slides().length);
        this.resetSlideshowTimer();
    }
    setCurrentSlide(index: number): void {
        this.currentSlide.set(index);
        this.resetSlideshowTimer();
    }
    toggleMenu(): void {
        this.isMobileMenuOpen.update(current => !current);
    }
    @HostListener('window:resize')
    onResize(): void {
        const lgBreakpoint = 1024;
        if (window.innerWidth >= lgBreakpoint && this.isMobileMenuOpen()) {
            this.isMobileMenuOpen.set(false);
        }
    }
}
