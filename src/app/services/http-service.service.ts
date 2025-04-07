import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { ClientData } from '../models/clients.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private readonly http = inject(HttpClient);
  baseUrl = computed(
    () =>
      'https://raw.githubusercontent.com/LightOfTheSun/front-end-coding-task-db/master/db.json'
  );

  getAllTableData(): Observable<ClientData[]> {
    return this.http.get<ClientData[]>(`${this.baseUrl()}`);
  }
}
