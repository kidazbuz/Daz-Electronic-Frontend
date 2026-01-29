import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IAgentSummaryResponse } from "../interfaces/sales";
import { environment } from '../environment/env_file';

@Injectable({ providedIn: 'root' })
export class SalesService {
    private API_BASE_URL = `${environment.apiUrl}`
    private PRODUCT_SPEC_API = `${this.API_BASE_URL}sales/products/specs/`;
    private SALES_RECORD_API = `${this.API_BASE_URL}sales/sales-records/`;
    private CUSTOMER_CREATE_API = `${this.API_BASE_URL}sales/customers/`;
    private closingUrl = `${this.API_BASE_URL}sales/sales-summary/close-day/`;
    private agentSummaryUrl = `${this.API_BASE_URL}sales/sales-summary/my-summary/`;

    constructor(private http: HttpClient) {}

    // For Autocomplete
    searchProductSpecs(query: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.PRODUCT_SPEC_API}?search=${query}`);
    }

    createCustomer(customerData: any): Observable<any> {
        return this.http.post(this.CUSTOMER_CREATE_API, customerData);
    }

    getSales(): Observable<any[]> {
      return this.http.get<any[]>(this.SALES_RECORD_API);
    }

    recordSale(saleData: any): Observable<any> {
        return this.http.post(this.SALES_RECORD_API, saleData);
    }

    closeDay(): Observable<any> {
      const url = `${this.closingUrl}`;
      return this.http.post<any>(url, {});
    }

    getMySummary(): Observable<IAgentSummaryResponse> {
      return this.http.get<IAgentSummaryResponse>(`${this.agentSummaryUrl}`);
    }

    addPayment(saleId: number, paymentData: any): Observable<any> {
        // Dynamic URL: /api/sales/sales-records/{id}/add-payment/
        return this.http.post(`${this.SALES_RECORD_API}${saleId}/add-payment/`, paymentData);
    }

}
