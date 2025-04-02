import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
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
import {
  ClientData,
  MonthlyStats,
  UserMetric,
} from '../../models/clients.model';

@Component({
  selector: 'app-short-information-page',
  imports: [CommonModule, SharedTableComponent],
  templateUrl: './short-information-page.component.html',
  styleUrl: './short-information-page.component.css',
})
export class ShortInformationPageComponent {
  private readonly dataService = inject(DataService);
  private readonly destroyRef = inject(DestroyRef);
  monthlyStats: MonthlyStats[] = [];
  isLoading = computed(() => this.dataService.isDataLoaded());
  errorMessage: string | null = null;
  topUsersByLoan = signal<UserMetric[]>([]);
  topUsersByInterest = signal<UserMetric[]>([]);
  topUsersByRatio = signal<UserMetric[]>([]);
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
    {
      tab: 'total-loans',
      tableHeaders: totalCreditsHeaders,
    },
    {
      tab: 'average-amount',
      tableHeaders: averageSumHeaders,
    },
    {
      tab: 'total-amount',
      tableHeaders: totalSumHeaders,
    },
    {
      tab: 'total-percent',
      tableHeaders: totalSumOfPercentHeaders,
    },
    {
      tab: 'returned-loans',
      tableHeaders: totalRetursHeaders,
    },
    {
      tab: 'top',
      tableHeaders: null,
    },
  ];

  ngOnInit(): void {
    if (this.clienntsData().length === 0) {
      this.dataService
        .getAllClientsData()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.fetchCreditData();
          this.calculateMetrics();
        });
    }
    this.fetchCreditData();
    this.calculateMetrics();
  }

  fetchCreditData(): void {
    this.processData(this.clienntsData());
  }

  processData(data: ClientData[]): void {
    const loansByMonth: Record<
      string,
      {
        count: number;
        totalAmount: number;
        totalPercent: number;
        returnedCount: number;
      }
    > = {};

    data.forEach((loan) => {
      const month = loan.issuance_date.substring(0, 7);

      if (!loansByMonth[month]) {
        loansByMonth[month] = {
          count: 0,
          totalAmount: 0,
          totalPercent: 0,
          returnedCount: 0,
        };
      }

      loansByMonth[month].count++;

      loansByMonth[month].totalAmount += loan.body || 0;

      loansByMonth[month].totalPercent += loan.percent || 0;

      if (loan.actual_return_date) {
        loansByMonth[month].returnedCount++;
      }
    });
    console.log(loansByMonth);

    this.monthlyStats = Object.entries(loansByMonth)
      .map(([month, stats]) => ({
        month,
        displayMonth: this.formatMonth(month),
        totalLoans: stats.count,
        averageAmount: Math.round(stats.totalAmount / stats.count),
        totalAmount: stats.totalAmount,
        totalPercent: stats.totalPercent,
        returnedLoans: stats.returnedCount,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  formatMonth(monthStr: string): string {
    const date = new Date(monthStr + '-01');
    return new Intl.DateTimeFormat('uk', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('uk-UA').format(value);
  }

  setActiveTab(tabId: string): void {
    this.tableHeaders.find((tab) => {
      if (tab.tab === tabId) {
        this.selectedTab.set({
          tab: tabId,
          tableHeaders: tab.tableHeaders || [],
        });
      }
    });
  }

  calculateMetrics(): void {
    const userLoansMap = new Map<string, ClientData[]>();
    this.clienntsData().forEach((loan) => {
      const userLoans = userLoansMap.get(loan.user) || [];
      userLoans.push(loan);
      userLoansMap.set(loan.user, userLoans);
    });

    const sortedData = Array.from(userLoansMap.entries())
      .map(([user, userLoans]) => ({
        user,
        count: userLoans.length,
        totalAmount: userLoans.reduce((sum, loan) => sum + loan.body, 0),
      }))
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count! - a.count!;
        }
        return b.totalAmount! - a.totalAmount!;
      })
      .slice(0, 10);

    this.topUsersByLoan.set(sortedData);
    const returnedLoans = this.clienntsData().filter(
      (loan) => loan.actual_return_date !== null
    );
    const userReturnedLoansMap = new Map<string, ClientData[]>();

    returnedLoans.forEach((loan) => {
      const userLoans = userReturnedLoansMap.get(loan.user) || [];
      userLoans.push(loan);
      userReturnedLoansMap.set(loan.user, userLoans);
    });

    const sortedReturnedClient = Array.from(userReturnedLoansMap.entries())
      .map(([user, userLoans]) => ({
        user,
        totalPaidInterest: userLoans.reduce(
          (sum, loan) => sum + loan.percent,
          0
        ),
        loanCount: userLoans.length,
      }))
      .sort((a, b) => b.totalPaidInterest! - a.totalPaidInterest!)
      .slice(0, 10);
    this.topUsersByInterest.set(sortedReturnedClient);
    const sortedRatioClients = Array.from(userReturnedLoansMap.entries())
      .map(([user, userLoans]) => {
        const totalLoanAmount = userLoans.reduce(
          (sum, loan) => sum + loan.body,
          0
        );
        const totalInterest = userLoans.reduce(
          (sum, loan) => sum + loan.percent,
          0
        );
        return {
          user,
          totalLoanAmount,
          totalPaidInterest: totalInterest,
          ratio: totalInterest / totalLoanAmount,
          loanCount: userLoans.length,
        };
      })
      .sort((a, b) => b.ratio! - a.ratio!)
      .slice(0, 10);
    this.topUsersByRatio.set(sortedRatioClients);
    console.log(this.topUsersByRatio());
  }
}
