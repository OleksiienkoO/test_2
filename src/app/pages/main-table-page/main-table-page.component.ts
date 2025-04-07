import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { SharedTableComponent } from '../../shared/shared-table/shared-table.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { headers } from './main-table-page.headders';
import { DataService } from '../../services/data.service';
import { FiltersPanelComponent } from '../../components/filters-panel/filters-panel.component';

@Component({
  selector: 'app-main-table-page',
  imports: [SharedTableComponent, FiltersPanelComponent],
  templateUrl: './main-table-page.component.html',
  styleUrl: './main-table-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainTablePageComponent implements OnInit {
  tableData = computed(() => this.dataService.filteredClients());
  private readonly dataService = inject(DataService);
  private readonly destroyRef = inject(DestroyRef);
  isLoaded = computed(() => this.dataService.isDataLoaded());

  headers = computed(() => headers);

  ngOnInit(): void {
    this.getTableData();
  }

  getTableData(): void {
    this.dataService
      .getAllClientsData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
