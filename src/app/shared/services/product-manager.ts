import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IImage, IVideo, IConnectivityDetail, IElectricalSpecs } from '../interfaces/product';
import { environment } from '../environment/env_file';

@Injectable({
  providedIn: 'root'
})
export class ProductManager {

  private baseUrl = environment.apiUrl;
  private apiUrl = `${this.baseUrl}products`;
  private softwareUrl = `${this.apiUrl}/softwares/`;

  private http = inject(HttpClient);

    // --- Helper for file upload forms (Multipart/FormData) ---
    private createFormData(data: any, fileKey: string, file?: File | string): FormData {
        const formData = new FormData();
        // Append all non-file fields
        for (const key in data) {
            if (key !== fileKey && data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        }
        // Append the file if it's a File object
        if (file instanceof File) {
             formData.append(fileKey, file, file.name);
        }
        return formData;
    }

    // --- 1. Product Images CRUD ---

    getImages(productId: number): Observable<IImage[]> {
        return this.http.get<IImage[]>(`${this.apiUrl}/images/`);
    }

    createImage(productId: number, data: IImage, file: File): Observable<IImage> {
        const formData = this.createFormData(data, 'image', file);
        return this.http.post<IImage>(`${this.apiUrl}/images/`, formData);
    }

    deleteImage(imageId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/images/${imageId}/`);
    }

    // --- 2. Product Videos CRUD (Similar to Images) ---

    getVideos(productId: number): Observable<IVideo[]> {
        return this.http.get<IVideo[]>(`${this.apiUrl}/videos/`);
    }

    createVideo(productId: number, data: IVideo, file: File): Observable<IVideo> {
        const formData = this.createFormData(data, 'video', file);
        return this.http.post<IVideo>(`${this.apiUrl}/videos/`, formData);
    }

    deleteVideo(videoId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/videos/${videoId}/`);
    }

    // --- 3. Product Connectivity CRUD ---

    getConnectivity(productId: number): Observable<IConnectivityDetail[]> {
        return this.http.get<IConnectivityDetail[]>(`${this.apiUrl}/connectivity/`);
    }

    createConnectivity(productId: number, data: IConnectivityDetail): Observable<IConnectivityDetail> {
        return this.http.post<IConnectivityDetail>(`${this.apiUrl}/connectivity/`, data);
    }

    updateConnectivity(itemId: number, data: Partial<IConnectivityDetail>): Observable<IConnectivityDetail> {
        return this.http.patch<IConnectivityDetail>(`${this.apiUrl}/connectivity/${itemId}/`, data);
    }

    deleteConnectivity(itemId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/connectivity/${itemId}/`);
    }

    // --- 4. Electrical Specifications (OneToOne CRUD) ---

    getElectricalSpecs(productId: number): Observable<IElectricalSpecs> {
        return this.http.get<IElectricalSpecs>(`${this.apiUrl}/specs/`);
    }

    createOrUpdateElectricalSpecs(productId: number, data: IElectricalSpecs): Observable<IElectricalSpecs> {
        // If the specs exist (have an ID), use PUT/PATCH, otherwise POST/PUT to the detail endpoint
        if (data.id) {
            return this.http.patch<IElectricalSpecs>(`${this.apiUrl}/specs/`, data);
        } else {
            return this.http.put<IElectricalSpecs>(`${this.apiUrl}/specs/`, data);
        }
    }

    getSoftwares(): Observable<any[]> {
        return this.http.get<any[]>(this.softwareUrl);
    }

    // Handles the multipart upload with progress tracking
    uploadSoftware(formData: FormData): Observable<HttpEvent<any>> {
        const req = new HttpRequest('POST', this.softwareUrl, formData, {
            reportProgress: true,
            responseType: 'json'
        });
        return this.http.request(req);
    }

    updateSoftware(id: number, data: any): Observable<any> {
        return this.http.patch(`${this.softwareUrl}${id}/`, data);
    }

    deleteSoftware(id: number): Observable<any> {
        return this.http.delete(`${this.softwareUrl}${id}/`);
    }

    downloadFile(id: number): void {
        window.open(`${this.softwareUrl}${id}/download/`, '_blank');
    }

}
