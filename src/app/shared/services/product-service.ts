import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/env_file';
import { IImage, IVideo, ProductMedia } from '../interfaces/product';

export interface Product {
    id?: number;
    name?: string;
    description?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    category?: number;
    price?: number;
    quantity?: number;
    inventoryStatus?: string;
    image?: string;
    rating?: number;
}

export interface Category {
    id: number;
    name: string;
}

export interface Spec {
    id?: number;
    product: number;
    actual_price: string
    discounted_price: string;
    model: string;
    supported_internet_services: { id: number; name: string }[];
    electrical_specs: { voltage: string; max_wattage: string; frequency: string };
    product_connectivity: { connectivity: number; connectivity_count: number }[];
    color: string;
    condition: string;
    smart_features?: boolean;
    brand?: number;
    screen_size?: number;
    resolution?: number;
    panel_type?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    private baseUrl = environment.apiUrl;

    private apiUrl = `${this.baseUrl}products/products/`;

    constructor(private http: HttpClient) {}

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(this.apiUrl);
    }

    createProduct(product: Product): Observable<Product> {
        return this.http.post<Product>(this.apiUrl, product);
    }

    updateProduct(product: Product): Observable<Product> {
        return this.http.put<Product>(`${this.apiUrl}${product.id}/`, product);
    }

    deleteProduct(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}${id}/`);
    }

    getCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(`${this.baseUrl}setups/categories/`);
    }

    getSetupData(endpoint: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}setups/${endpoint}/`);
    }

    saveSpecs(spec: Spec): Observable<Spec> {
        return this.http.post<Spec>(`${this.baseUrl}products/specs/`, spec);
    }

    getSpecs(): Observable<Spec[]> {
        return this.http.get<Spec[]>(`${this.baseUrl}products/specs/`);
    }

    updateSpec(spec: Spec): Observable<Spec> {
        return this.http.put<Spec>(`${this.baseUrl}products/specs/${spec.id}/`, spec);
    }


    deleteSpec(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}products/specs/${id}/`);
    }

    saveSpecsImages(formData: FormData): Observable<HttpEvent<any>> {
        return this.http.post<any>(`${this.baseUrl}products/images/`, formData, {
            reportProgress: true,
            observe: 'events'
        });
    }

    deleteSpecImage(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}products/images-delete/${id}`);
    }

    saveSpecsVideos(data: FormData): Observable<HttpEvent<any>> {
        return this.http.post<any>(`${this.baseUrl}products/videos/`, data, {
            reportProgress: true,
            observe: 'events'
        });
    }

    deleteSpecVideo(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}products/videos-delete/${id}`);
    }

    getProductMedia(): Observable<ProductMedia[]> {
        return this.http.get<ProductMedia[]>(`${this.baseUrl}products/media-list`);
    }

}
