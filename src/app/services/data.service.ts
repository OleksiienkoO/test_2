import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpService } from './http-service.service';
import { catchError, finalize, Observable, tap } from 'rxjs';
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

  getAllClientsData(): Observable<ClientData[]> {
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

  private filterByIssueDate(
    clients: ClientData[],
    filters: ClientFilters
  ): ClientData[] {
    if (!filters.issueDateFrom && !filters.issueDateTo) {
      return clients;
    }

    return clients.filter((client) => {
      const clientDate = new Date(client.issuance_date);

      if (filters.issueDateFrom && clientDate < filters.issueDateFrom) {
        return false;
      }

      if (filters.issueDateTo && clientDate > new Date(filters.issueDateTo)) {
        return false;
      }

      return true;
    });
  }

  private filterByReturnDate(
    clients: ClientData[],
    filters: ClientFilters
  ): ClientData[] {
    if (!filters.returnDateFrom && !filters.returnDateTo) {
      return clients;
    }

    return clients.filter((client) => {
      if (client.actual_return_date === null) {
        return false;
      }

      const clientDate = new Date(client.actual_return_date);

      if (filters.returnDateFrom && clientDate < filters.returnDateFrom) {
        return false;
      }

      if (filters.returnDateTo && clientDate > new Date(filters.returnDateTo)) {
        return false;
      }

      return true;
    });
  }

  private filterOverdueLoans(
    clients: ClientData[],
    filters: ClientFilters
  ): ClientData[] {
    if (!filters.overdueOnly) {
      return clients;
    }

    return clients.filter((client) => this.isOverdueLoan(client));
  }

  filteredClients = computed(() => {
    let clients = this.clientsData();
    const currentFilters = this.filters();

    clients = this.filterByIssueDate(clients, currentFilters);
    clients = this.filterByReturnDate(clients, currentFilters);
    clients = this.filterOverdueLoans(clients, currentFilters);

    return clients;
  });

  updateFilters(newFilters: ClientFilters): void {
    this.filters.update((filters) => ({
      ...filters,
      ...newFilters,
    }));
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
