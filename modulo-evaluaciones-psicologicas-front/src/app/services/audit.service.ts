import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuditService {
  constructor(private readonly http: HttpClient) {}

  getLogs(from?: string, to?: string, page = 0, size = 20): Observable<any> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get(`${environment.catalogBaseUrl}/audits`, { params });
  }
}
