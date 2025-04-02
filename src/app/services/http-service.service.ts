import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { API_URL } from '../../../env';
import { ClientData } from '../models/clients.model';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private readonly http = inject(HttpClient);
  baseUrl = computed(() => API_URL);

  getAllTableData() {
    return this.http.get<ClientData[]>(`${this.baseUrl()}`);
  }
}
