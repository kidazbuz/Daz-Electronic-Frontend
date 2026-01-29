import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Observable,
  of,
  forkJoin,
  switchMap,
  debounceTime,
  tap,
  finalize,
  startWith,
  catchError
} from 'rxjs';
import { IProductSpecification, IPaginatedSpecificationList, IProductRecommendation } from '../interfaces/product';
import { ShippingMethod, TrackingDetail } from '../interfaces/shipping';
import { LocationResponse } from '../interfaces/user';
import { ExpensePayload, ICategory, IPayee, IExpense } from '../interfaces/expenses';
import { Entity, DistrictEntity, WardEntity, StreetEntity, PostcodeEntity, AddressDataResponse } from '../interfaces/setups';
import { environment } from '../environment/env_file';
import { TableActionContext } from '../interfaces/nav.config';
import { MenuItem } from 'primeng/api';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Master {

  private API_BASE_URL = environment.apiUrl;

  constructor(private http: HttpClient) {
    this.refreshCart();
  }

  public CATALOG_URL = `${this.API_BASE_URL}products/public-catalog/`
  public FiltersUrl = `${this.CATALOG_URL}filters`;
  public salesUrl = `${this.API_BASE_URL}sales/`;
  private shippingUrl = `${this.API_BASE_URL}setups/shipping-methods/`;
  private trackUrl = `${this.API_BASE_URL}shipping/track/`;
  private expenseUrl = `${this.API_BASE_URL}expenses/data/`;
  private categoriesUrl = `${this.API_BASE_URL}expenses/categories/`;
  private payeesUrl = `${this.API_BASE_URL}expenses/payees/`;
  private locationsUrl = `${this.API_BASE_URL}auth/locations/`;
  private completeRegistrationUrl = `${this.API_BASE_URL}auth/profiles/complete_registration/`;

  private actionSource = new Subject<TableActionContext<any>>();
  action$ = this.actionSource.asObservable();
  private cartState = signal<any>(null);
  cartItems = computed(() => this.cartState()?.items || []);
  cartCount = computed(() => this.cartState()?.item_count || 0);
  totalAmount = computed(() => this.cartState()?.grand_total || 0);
  savings = computed(() => this.cartState()?.savings || 0);

  refreshCart() {
    this.http.get(`${this.salesUrl}carts/`).subscribe(cart => this.cartState.set(cart));
  }

  addToCart(variantId: string, quantity: number) {
    return this.http.post(`${this.salesUrl}carts-items/`, {
      product_variant: variantId,
      quantity
    }).pipe(
      tap(() => this.refreshCart()) // Auto-refresh state after adding
    );
  }

  updateItemQuantity(itemId: string, quantity: number) {
    return this.http.patch(`${this.salesUrl}carts-items/${itemId}/`, {
      quantity
    }).pipe(
      tap(() => this.refreshCart()) // Triggers total recalculation across the UI
    );
  }

  removeItem(itemId: string | number) {
    return this.http.delete(`${this.salesUrl}carts-items/${itemId}/`).pipe(
      tap(() => this.refreshCart())
    );
  }

  clearCart() {
     // Assuming an action in your ShoppingCartViewSet exists for this
     return this.http.delete('/api/cart/clear/').pipe(
       tap(() => this.refreshCart())
     );
  }

  private readonly LIBRARY: { [key: string]: any } = {
      'view':   { label: 'View', icon: 'pi pi-eye' },
      'edit':   { label: 'Edit', icon: 'pi pi-pencil' },
      'media':  { label: 'Manage Media', icon: 'pi pi-images' },
      'delete': { label: 'Delete', icon: 'pi pi-trash', styleClass: 'text-red-500' },
      'sep':    { separator: true }
  };

  getMenuItems(item: any, keys: string[]): MenuItem[] {
      return keys.map(key => {
          if (key === 'sep') return { separator: true };

          return {
              ...this.LIBRARY[key],
              command: () => this.actionSource.next({ item, actionKey: key })
          };
      });
  }


  getProducts(): Observable<IProductSpecification[]> {
    return this.http.get<IProductSpecification[]>(this.CATALOG_URL);
  }

  getProductFilters(): Observable<any>{
    return this.http.get<any>(this.FiltersUrl);
  }

  getProductById(id: string): Observable<IProductSpecification> {
    const url = `${this.CATALOG_URL}${id}/`;
    return this.http.get<IProductSpecification>(url);
  }

  getSimilarProducts(id: string | number): Observable<IProductRecommendation[]> {
    return this.http.get<IProductRecommendation[]>(`${this.CATALOG_URL}${id}/recommendations/`);
  }

  getMoreYouMayLove(variantIds: string[]): Observable<IProductRecommendation[]> {
      const ids = variantIds.join(',');
      return this.http.get<IProductRecommendation[]>(`${this.CATALOG_URL}more_you_may_love/`, {
          params: { ids: ids }
      });
  }

  fetchProducts(query: string): Observable<IProductSpecification[]> {
    const searchUrl = `${this.CATALOG_URL}?search=${encodeURIComponent(query)}`;

    return new Observable<IProductSpecification[]>((subscriber) => {
      let isCanceled = false;

      const fetchData = async () => {
        try {
          const response = await fetch(searchUrl);

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`HTTP Status Error: ${response.status}. Response: ${errorText}`);
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const apiResponse: IPaginatedSpecificationList = await response.json();

          if (isCanceled) return;

          subscriber.next(apiResponse.results);
          subscriber.complete();

        } catch (error) {
          if (!isCanceled) {
            console.error('API Search Error during fetch or parsing:', query, error);
            subscriber.error(error);
          }
        }
      };

      fetchData();

      return () => {
        isCanceled = true;
      };
    }).pipe(
      catchError(() => {
        return of([]);
      })
    );
  }

  getAvailableMethods(): Observable<ShippingMethod[]> {
    return this.http.get<ShippingMethod[]>(this.shippingUrl);
  }

  trackOrder(shipmentNumber: string): Observable<TrackingDetail> {
    return this.http.get<TrackingDetail>(`${this.trackUrl}${shipmentNumber}`);
    // return this.http.get<TrackingDetail>(`${this.trackUrl}?search${shipmentNumber}`);
  }

  // http://127.0.0.1:8000/api/shipping/track/?search=1234567890

  getAllExpenses(): Observable<IExpense[]> {
    return this.http.get<IExpense[]>(this.expenseUrl);
  }

  fetchCategories(): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(this.categoriesUrl);
  }

  fetchPayees(): Observable<IPayee[]> {
    return this.http.get<IPayee[]>(this.payeesUrl);
  }

  createExpense(payload: IExpense): Observable<any> {
    return this.http.post<any>(this.expenseUrl, payload);
  }


  getLocations(
    level: string,
    region?: string,
    district?: string,
    ward?: string
  ): Observable<LocationResponse[]> {
    let params = new HttpParams().set('level', level);

    if (region) params = params.set('region', region);
    if (district) params = params.set('district', district);
    if (ward) params = params.set('ward', ward);

    return this.http.get<LocationResponse[]>(this.locationsUrl, { params });
  }

  completeRegistration(rawData: any): Observable<any> {
      const formData = new FormData();

      formData.append('title', rawData.personalInfo.title);
      formData.append('first_name', rawData.personalInfo.first_name);
      formData.append('middle_name', rawData.personalInfo.middle_name || '');
      formData.append('last_name', rawData.personalInfo.last_name);
      formData.append('birth_date', this.formatDate(rawData.personalInfo.birth_date));
      formData.append('nationality', rawData.personalInfo.nationality || 'Tanzanian');
      formData.append('email', rawData.personalInfo.email || '');
      formData.append('phone_number', rawData.personalInfo.phone_number);
      formData.append('second_phone_number', rawData.personalInfo.second_phone_number || '');

      if (rawData.profile_picture) {
        formData.append('profile_picture', rawData.profile_picture);
      }

      formData.append('address', JSON.stringify(rawData.address));
      formData.append('next_of_kin', JSON.stringify(rawData.next_of_kin));

      formData.append('is_profile_complete', 'true');

      return this.http.put(this.completeRegistrationUrl, formData);
    }

    private formatDate(date: any): string {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    }

  requestPasswordResetOtp(email: string): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}auth/request/password-reset-otp/`, { email });
  }

  confirmPasswordReset(data: { email: string; code: string; new_password: string }): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}auth/password-reset/confirm/`, data);
  }

}
