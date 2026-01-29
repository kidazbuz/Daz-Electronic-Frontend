import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable, map } from 'rxjs';
import { Master } from './master';
import { CartItem, ShoppingCart } from '../interfaces/cart';
import { ShippingMethod } from '../interfaces/shipping';
import { IProductSpecification } from '../interfaces/product';
import { environment } from '../environment/env_file';

@Injectable({
  providedIn: 'root',
})
export class Cart {

  private API_BASE_URL = environment.apiUrl;

  public apiUrl = `${this.API_BASE_URL}sales/carts`;

  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  private cartSubject = new BehaviorSubject<ShoppingCart | null>(null);
  cart$ = this.cartSubject.asObservable();

  private shippingMethodsSubject = new BehaviorSubject<ShippingMethod[]>([]);
  public shippingMethods$ = this.shippingMethodsSubject.asObservable();

  private selectedMethodIdSubject = new BehaviorSubject<number | null>(null);
  public selectedMethodId$ = this.selectedMethodIdSubject.asObservable();

  constructor(private shippingService: Master, private http: HttpClient) {
    // Load cart from local storage on startup (best practice)
    this.loadCart();
    this.fetchShippingMethods();
  }

  private loadCart(): void {
    const items = localStorage.getItem('ecom_cart');
    if (items) {
      this.cartItemsSubject.next(JSON.parse(items));
    }
  }

  private fetchShippingMethods(): void {
    this.shippingService.getAvailableMethods().subscribe(methods => {
      this.shippingMethodsSubject.next(methods);

      // Select the cheapest method by default if none is selected
      if (methods.length > 0 && this.selectedMethodIdSubject.value === null) {
        const cheapest = methods.reduce((prev, curr) =>
          parseFloat(prev.base_cost) < parseFloat(curr.base_cost) ? prev : curr
        );
        this.setSelectedMethod(cheapest.id);
      }
    });
  }

  setSelectedMethod(methodId: number): void {
    this.selectedMethodIdSubject.next(methodId);
  }

  subtotal$: Observable<number> = this.cartItems$.pipe(
    map(items => items.reduce((total, item) => {
      const price = parseFloat(item.product.discounted_price);
      return total + (isNaN(price) ? 0 : price * item.quantity);
    }, 0))
  );

  tax$: Observable<number> = this.subtotal$.pipe(
    map(subtotal => parseFloat((subtotal * 0.00).toFixed(2)))
  );

  shippingCost$: Observable<number> = combineLatest([
    this.subtotal$,
    this.selectedMethodId$,
    this.shippingMethods$
  ]).pipe(
    map(([subtotal, selectedId, methods]) => {
      const selectedMethod = methods.find(m => m.id === selectedId);

      if (!selectedMethod) return 0; // Return 0 if no method is selected

      const baseCost = parseFloat(selectedMethod.base_cost);
      const threshold = parseFloat(selectedMethod.free_shipping_threshold);

      if (isNaN(baseCost) || isNaN(threshold)) return 0; // Data integrity check

      // Apply Free Shipping Rule
      if (subtotal >= threshold) {
        return 0;
      }

      return baseCost;
    })
  );

  total$: Observable<number> = combineLatest([
    this.subtotal$,
    this.tax$,
    this.shippingCost$
  ]).pipe(
    map(([subtotal, tax, shipping]) => subtotal + tax + shipping)
  );

  get subtotal(): number {

    return this.cartItemsSubject.value.reduce((total: number, item: CartItem) => {
      const price = parseFloat(item.product.discounted_price);

      return total + (isNaN(price) ? 0 : price * item.quantity);
    }, 0);
  }
  get tax(): number { return this.subtotal * 0.05; }

  get shippingCost(): number {
    const selectedMethod = this.shippingMethodsSubject.value.find(m => m.id === this.selectedMethodIdSubject.value);
    if (!selectedMethod) return 0;
    const baseCost = parseFloat(selectedMethod.base_cost);
    const threshold = parseFloat(selectedMethod.free_shipping_threshold);
    if (this.subtotal >= threshold) return 0;
    return baseCost;
  }

  get total(): number { return this.subtotal + this.tax + this.shippingCost; }

  private saveCart(): void {
    localStorage.setItem('ecom_cart', JSON.stringify(this.cartItemsSubject.value));
  }


  addItem(product: IProductSpecification, quantity: number, color: string, size: string): void {
      const currentItems = [...this.cartItemsSubject.value];
      const index = currentItems.findIndex(
        i => i.product.id === product.id && i.selectedColor === color && i.selectedSize === size
      );

      if (index > -1) {

        currentItems[index] = {
          ...currentItems[index],
          quantity: currentItems[index].quantity + quantity
        };
      } else {

        const newItem: CartItem = {
          id: Date.now(),
          product: product,
          quantity: quantity,
          selectedColor: color,
          selectedSize: size
        };
        currentItems.push(newItem);
      }

      this.cartItemsSubject.next(currentItems);
      this.saveCart();
  }


  removeItem(itemId: number): void {
    const items = this.cartItemsSubject.value.filter(i => i.id !== itemId);
    this.cartItemsSubject.next(items);
    this.saveCart();
  }

  clearAllItems(): void {
    this.cartItemsSubject.next([]);
    this.saveCart();
  }


  updateQuantity(itemId: number, newQuantity: number): void {
    const items = this.cartItemsSubject.value;
    const item = items.find(i => i.id === itemId);

    if (item) {
      item.quantity = newQuantity > 0 ? newQuantity : 1;
    }

    this.cartItemsSubject.next(items);
    this.saveCart();
  }

  getShoppingCart(): Observable<ShoppingCart> {
    return this.http.get<ShoppingCart>(`${this.apiUrl}/`).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  addToShoppingCart(productVariantId: string, quantity: number): Observable<ShoppingCart> {
    const payload = { product_variant: productVariantId, quantity: quantity };
    return this.http.post<ShoppingCart>(`${this.apiUrl}/`, payload).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  updateQuantityToShoppingCart(itemId: number, quantity: number): Observable<ShoppingCart> {
    const payload = { quantity: quantity };
    return this.http.patch<ShoppingCart>(`${this.apiUrl}/${itemId}/`, payload).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  removeItemFromShoppingCart(itemId: number): Observable<ShoppingCart> {
    return this.http.delete<ShoppingCart>(`${this.apiUrl}/${itemId}/`).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

}
