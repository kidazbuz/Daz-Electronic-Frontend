import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/env_file';
import {
  Supplier,
  PurchaseOrder,
  StockReception,
  PoStatus, CreatePurchaseOrderPayload
} from '../interfaces/stock';

@Injectable({ providedIn: 'root' })
export class InventoryService {
    private baseUrl = `${environment.apiUrl}`;
    private stockUrl = `${this.baseUrl}inventory/management/`;
    private locationUrl = `${this.baseUrl}inventory/locations/`;
    private productSpecUrl = `${this.baseUrl}products/specs/`;

    constructor(private http: HttpClient) {}


    getSuppliers(): Observable<Supplier[]> {
      return this.http.get<Supplier[]>(`${this.baseUrl}setups/suppliers/`);
    }

    getSupplierById(id: number): Observable<Supplier> {
      return this.http.get<Supplier>(`${this.baseUrl}setups/suppliers/${id}/`);
    }

    createSupplier(supplier: Partial<Supplier>): Observable<Supplier> {
      return this.http.post<Supplier>(`${this.baseUrl}setups/suppliers/`, supplier);
    }

    updateSupplier(id: number, supplier: Partial<Supplier>): Observable<Supplier> {
      return this.http.patch<Supplier>(`${this.baseUrl}setups/suppliers/${id}/`, supplier);
    }

    deleteSupplier(id: number): Observable<void> {
      return this.http.delete<void>(`${this.baseUrl}setups/suppliers/${id}/`);
    }

    getPurchaseOrders(): Observable<PurchaseOrder[]> {
      return this.http.get<PurchaseOrder[]>(`${this.baseUrl}purchasing/orders/`);
    }

    getPurchaseOrderById(id: number): Observable<PurchaseOrder> {
      return this.http.get<PurchaseOrder>(`${this.baseUrl}purchasing/orders/${id}/`);
    }

    createPurchaseOrder(payload: CreatePurchaseOrderPayload): Observable<PurchaseOrder> {
      return this.http.post<PurchaseOrder>(`${this.baseUrl}purchasing/orders/`, payload);
    }

    updateOrderStatus(id: number, status: PoStatus): Observable<PurchaseOrder> {
      return this.http.patch<PurchaseOrder>(
        `${this.baseUrl}purchasing/orders/${id}/update-status/`,
        { po_status: status }
      );
    }

    deletePurchaseOrder(id: number): Observable<void> {
      return this.http.delete<void>(`${this.baseUrl}purchasing/orders/${id}/`);
    }

    getReceptions(): Observable<StockReception[]> {
      return this.http.get<StockReception[]>(`${this.baseUrl}purchasing/receptions/`);
    }

    getReceptionById(id: number): Observable<StockReception> {
      return this.http.get<StockReception>(`${this.baseUrl}purchasing/receptions/${id}/`);
    }

    createReception(reception: Partial<StockReception>): Observable<StockReception> {
      return this.http.post<StockReception>(`${this.baseUrl}purchasing/receptions/`, reception);
    }

    deleteReception(id: number): Observable<void> {
      return this.http.delete<void>(`${this.baseUrl}purchasing/receptions/${id}/`);
    }

    getStocks(): Observable<any[]> {
        return this.http.get<any[]>(this.stockUrl);
    }

    createStock(payload: any): Observable<any> {
        return this.http.post(this.stockUrl, payload);
    }

    updateStock(id: number, payload: any): Observable<any> {
        return this.http.put(`${this.stockUrl}${id}/`, payload);
    }

    deleteStock(id: number): Observable<any> {
        return this.http.delete(`${this.stockUrl}${id}/`);
    }

    searchProducts(query: string): Observable<any[]> {
        const params = new HttpParams().set('search', query);
        return this.http.get<any[]>(this.productSpecUrl, { params });
    }

    searchLocations(query: string): Observable<any[]> {
        const params = new HttpParams().set('search', query);
        return this.http.get<any[]>(this.locationUrl, { params });
    }
}
