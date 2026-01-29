import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/env_file';
import { IDashboardMaster } from '../interfaces/analytics';

@Injectable({
  providedIn: 'root'
})
export class Analytics {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}analytics`;

  getDashboardSummary(): Observable<IDashboardMaster> {
      return this.http.get<IDashboardMaster>(`${this.apiUrl}/status`);
  }


}
