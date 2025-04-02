export interface ClientFilters {
  issueDateFrom?: Date | null;
  issueDateTo?: Date | null;
  returnDateFrom?: Date | null;

  returnDateTo?: Date | null;
  overdueOnly?: boolean;
}
