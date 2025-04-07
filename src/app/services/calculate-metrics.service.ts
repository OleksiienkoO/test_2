import { computed, inject, Injectable, signal } from '@angular/core';
import { ClientData, MonthlyStats, UserMetric } from '../models/clients.model';
import { DataService } from './data.service';

@Injectable({ providedIn: 'root' })
export class CalculateMetricsService {
  private readonly dataService = inject(DataService);
  clienntsData = computed(() => this.dataService.clientsData());
  monthlyStats = signal<MonthlyStats[]>([]);

  topUsersByLoan = signal<UserMetric[]>([]);
  topUsersByInterest = signal<UserMetric[]>([]);
  topUsersByRatio = signal<UserMetric[]>([]);

  calculateMetrics(): void {
    this.calculateTopUsersByLoanCount();
    this.calculateTopUsersByPaidInterest();
    this.calculateTopUsersByInterestRatio();
  }

  private calculateTopUsersByLoanCount(): void {
    const userLoansMap = this.groupLoansByUser(this.clienntsData());

    const sortedData = Array.from(userLoansMap.entries())
      .map(([user, userLoans]) => ({
        user,
        count: userLoans.length,
        totalAmount: this.calculateTotalAmount(userLoans),
      }))
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count! - a.count!;
        }
        return b.totalAmount! - a.totalAmount!;
      })
      .slice(0, 10);

    this.topUsersByLoan.set(sortedData);
  }

  private calculateTopUsersByPaidInterest(): void {
    const returnedLoans = this.getReturnedLoans();
    const userReturnedLoansMap = this.groupLoansByUser(returnedLoans);

    const sortedReturnedClient = Array.from(userReturnedLoansMap.entries())
      .map(([user, userLoans]) => ({
        user,
        totalPaidInterest: this.calculateTotalInterest(userLoans),
        loanCount: userLoans.length,
      }))
      .sort((a, b) => b.totalPaidInterest! - a.totalPaidInterest!)
      .slice(0, 10);

    this.topUsersByInterest.set(sortedReturnedClient);
  }

  private calculateTopUsersByInterestRatio(): void {
    const returnedLoans = this.getReturnedLoans();
    const userReturnedLoansMap = this.groupLoansByUser(returnedLoans);

    const sortedRatioClients = Array.from(userReturnedLoansMap.entries())
      .map(([user, userLoans]) => {
        const totalLoanAmount = this.calculateTotalAmount(userLoans);
        const totalInterest = this.calculateTotalInterest(userLoans);

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
  }
  private groupLoansByUser(loans: ClientData[]): Map<string, ClientData[]> {
    const userLoansMap = new Map<string, ClientData[]>();

    loans.forEach((loan) => {
      const userLoans = userLoansMap.get(loan.user) || [];
      userLoans.push(loan);
      userLoansMap.set(loan.user, userLoans);
    });

    return userLoansMap;
  }

  private getReturnedLoans(): ClientData[] {
    return this.clienntsData().filter(
      (loan) => loan.actual_return_date !== null
    );
  }

  private calculateTotalAmount(loans: ClientData[]): number {
    return loans.reduce((sum, loan) => sum + loan.body, 0);
  }

  private calculateTotalInterest(loans: ClientData[]): number {
    return loans.reduce((sum, loan) => sum + loan.percent, 0);
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

    const montlyStats = Object.entries(loansByMonth)
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
    this.monthlyStats.set(montlyStats);
  }
  formatMonth(monthStr: string): string {
    const date = new Date(monthStr + '-01');
    return new Intl.DateTimeFormat('uk', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  }
}
