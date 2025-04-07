import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DataService } from '../../services/data.service';
import {
  averageSumHeaders,
  totalCreditsHeaders,
  totalRetursHeaders,
  totalSumHeaders,
  totalSumOfPercentHeaders,
} from './short-info.headers';
import { SharedTableComponent } from '../../shared/shared-table/shared-table.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableHeader } from '../../models/table.model';
import { CalculateMetricsService } from '../../services/calculate-metrics.service';
import { MetricsTabsComponent } from '../../components/metrics-tabs/metrics-tabs.component';

@Component({
  selector: 'app-short-information-page',
  imports: [CommonModule, SharedTableComponent, MetricsTabsComponent],
  templateUrl: './short-information-page.component.html',
  styleUrl: './short-information-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShortInformationPageComponent implements OnInit {
  private readonly calculateMetricsService = inject(CalculateMetricsService);
  private readonly dataService = inject(DataService);
  private readonly destroyRef = inject(DestroyRef);

  monthlyStats = computed(() => this.calculateMetricsService.monthlyStats());
  isLoading = computed(() => this.dataService.isDataLoaded());
  topUsersByLoan = computed(() =>
    this.calculateMetricsService.topUsersByLoan()
  );
  topUsersByInterest = computed(() =>
    this.calculateMetricsService.topUsersByInterest()
  );
  topUsersByRatio = computed(() =>
    this.calculateMetricsService.topUsersByRatio()
  );

  headers = {
    ratio: [
      { label: 'Клієнт', key: 'user' },
      { label: 'Сума кредитів', key: 'totalLoanAmount' },
      { label: 'Сплачені відсотки', key: 'totalPaidInterest' },
      { label: 'Співвідношення', key: 'ratio' },
    ],
    interest: [
      { label: 'Клієнт', key: 'user' },
      { label: 'Сплачені відсотки', key: 'totalPaidInterest' },
      { label: 'Кількість кредитів', key: 'loanCount' },
    ],
    loans: [
      { label: 'Клієнт', key: 'user' },
      { label: 'Кількість кредитів', key: 'count' },
      { label: 'Сума кредитів', key: 'totalAmount' },
    ],
  };

  clienntsData = computed(() => this.dataService.clientsData());

  selectedTab = signal<{ tab: string; tableHeaders: TableHeader[] }>({
    tab: 'total-loans',
    tableHeaders: totalCreditsHeaders,
  });

  tableHeaders = [
    { tab: 'total-loans', tableHeaders: totalCreditsHeaders },
    { tab: 'average-amount', tableHeaders: averageSumHeaders },
    { tab: 'total-amount', tableHeaders: totalSumHeaders },
    { tab: 'total-percent', tableHeaders: totalSumOfPercentHeaders },
    { tab: 'returned-loans', tableHeaders: totalRetursHeaders },
    { tab: 'top', tableHeaders: null },
  ];

  ngOnInit(): void {
    if (this.clienntsData().length === 0) {
      this.dataService
        .getAllClientsData()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.fetchCreditData();
          this.calculateMetricsService.calculateMetrics();
        });
    }
    this.fetchCreditData();
    this.calculateMetricsService.calculateMetrics();
  }

  fetchCreditData(): void {
    this.calculateMetricsService.processData(this.clienntsData());
  }

  setActiveTab(tabId: string): void {
    const tab = this.tableHeaders.find((tab) => tab.tab === tabId);
    if (tab) {
      this.selectedTab.set({
        tab: tabId,
        tableHeaders: tab.tableHeaders || [],
      });
    }
  }
}
