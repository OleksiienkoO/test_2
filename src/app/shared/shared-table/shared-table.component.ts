import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { TableHeader } from '../../models/table.model';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shared-table',
  imports: [NgxPaginationModule, FormsModule],
  templateUrl: './shared-table.component.html',
  styleUrl: './shared-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedTableComponent {
  tableHeaders = input.required<TableHeader[]>();
  tableData = input.required<any>();
  currentPage = signal(1);
  itemsPerPage = signal(10);
  formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
}
