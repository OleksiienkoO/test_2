export interface ClientData {
  id: number;
  user: string;
  issuance_date: string;
  return_date: string;
  actual_return_date: string | null;
  body: number;
  percent: number;
}

export interface MonthlyStats {
  month: string;
  displayMonth: string;
  totalLoans: number;
  averageAmount: number;
  totalAmount: number;
  totalPercent: number;
  returnedLoans: number;
}

export interface UserMetric {
  user: string;
  count?: number;
  totalAmount?: number;
  totalPaidInterest?: number;
  ratio?: number;
  loanCount?: number;
}
