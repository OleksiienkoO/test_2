import { Component, inject } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ClientFilters } from '../../models/filters.model';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-filters-panel',
  imports: [NgbDatepickerModule, ReactiveFormsModule, FormsModule],
  templateUrl: './filters-panel.component.html',
  styleUrl: './filters-panel.component.css',
})
export class FiltersPanelComponent {
  private readonly dataService = inject(DataService);

  issueDateFrom: string | null = null;
  issueDateTo: string | null = null;
  returnDateFrom: string | null = null;
  returnDateTo: string | null = null;
  overdueOnly = false;

  onIssueDateFromChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.issueDateFrom = input.value;
    this.applyFilters();
  }

  onIssueDateToChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.issueDateTo = input.value;
    this.applyFilters();
  }

  onReturnDateFromChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.returnDateFrom = input.value;
    this.applyFilters();
  }

  onReturnDateToChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.returnDateTo = input.value;
    this.applyFilters();
  }

  private applyFilters() {
    const filterUpdate: ClientFilters = {
      overdueOnly: this.overdueOnly ? true : undefined,
    };

    filterUpdate.issueDateFrom = this.issueDateFrom
      ? new Date(this.issueDateFrom)
      : undefined;
    filterUpdate.issueDateTo = this.issueDateTo
      ? new Date(this.issueDateTo)
      : undefined;
    filterUpdate.returnDateFrom = this.returnDateFrom
      ? new Date(this.returnDateFrom)
      : undefined;
    filterUpdate.returnDateTo = this.returnDateTo
      ? new Date(this.returnDateTo)
      : undefined;

    this.dataService.updateFilters(filterUpdate);
  }

  onOverdueLoansToggle(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const filterUpdate: ClientFilters = {
      overdueOnly: checkbox.checked ? true : undefined,
    };
    this.dataService.updateFilters(filterUpdate);
  }
}
