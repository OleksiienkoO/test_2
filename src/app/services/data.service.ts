import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpService } from './http-service.service';
import { catchError, finalize, tap } from 'rxjs';
import { ClientData } from '../models/clients.model';
import { ClientFilters } from '../models/filters.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private readonly httpService = inject(HttpService);
  isDataLoaded = signal(false);
  clientsData = signal<ClientData[]>([]);
  private filters = signal<ClientFilters>({});

  getAllClientsData() {
    this.isDataLoaded.set(false);
    return this.httpService.getAllTableData().pipe(
      tap((response) => {
        this.clientsData.set(response);
      }),
      catchError((error) => {
        console.error('Error fetching data:', error);
        return [];
      }),
      finalize(() => this.isDataLoaded.set(true))
    );
  }

  filteredClients = computed(() => {
    let clients = this.clientsData();
    const currentFilters = this.filters();

    if (currentFilters.issueDateFrom || currentFilters.issueDateTo) {
      clients = clients.filter((client) => {
        const clientDate = new Date(client.issuance_date);

        if (
          currentFilters.issueDateFrom &&
          clientDate < currentFilters.issueDateFrom
        ) {
          return false;
        }

        if (currentFilters.issueDateTo) {
          const toDate = new Date(currentFilters.issueDateTo);

          if (clientDate > toDate) {
            return false;
          }
        }

        return true;
      });
    }

    if (currentFilters.returnDateFrom || currentFilters.returnDateTo) {
      clients = clients.filter((client) => {
        if (client.actual_return_date === null) {
          return false;
        }

        const clientDate = new Date(client.actual_return_date);

        if (
          currentFilters.returnDateFrom &&
          clientDate < currentFilters.returnDateFrom
        ) {
          return false;
        }

        if (currentFilters.returnDateTo) {
          const toDate = new Date(currentFilters.returnDateTo);

          if (clientDate > toDate) {
            return false;
          }
        }

        return true;
      });
    }

    if (currentFilters.overdueOnly) {
      clients = clients.filter((client) => this.isOverdueLoan(client));
    }

    return clients;
  });
  updateFilters(newFilters: ClientFilters) {
    this.filters.set({
      ...this.filters(),
      ...newFilters,
    });
  }

  private isOverdueLoan(client: ClientData): boolean {
    const plannedReturnDate = new Date(client.return_date);
    const today = new Date();

    if (client.actual_return_date) {
      const actualReturnDate = new Date(client.actual_return_date);
      return actualReturnDate > plannedReturnDate;
    }

    return plannedReturnDate < today;
  }
}
