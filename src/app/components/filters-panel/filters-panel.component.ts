import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DataService } from '../../services/data.service';
import { ClientFilters } from '../../models/filters.model';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-filters-panel',
  imports: [NgbDatepickerModule, ReactiveFormsModule, FormsModule],
  templateUrl: './filters-panel.component.html',
  styleUrl: './filters-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersPanelComponent implements OnInit {
  private readonly dataService = inject(DataService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  filterForm: FormGroup = this.fb.group({
    issueDateFrom: [null],
    issueDateTo: [null],
    returnDateFrom: [null],
    returnDateTo: [null],
    overdueOnly: [false],
  });

  ngOnInit(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((formValues) => {
        this.applyFilters(formValues);
      });
  }

  private applyFilters(formValues: any): void {
    const filterUpdate: ClientFilters = {
      overdueOnly: formValues.overdueOnly ? true : undefined,
      issueDateFrom: formValues.issueDateFrom
        ? new Date(formValues.issueDateFrom)
        : undefined,
      issueDateTo: formValues.issueDateTo
        ? new Date(formValues.issueDateTo)
        : undefined,
      returnDateFrom: formValues.returnDateFrom
        ? new Date(formValues.returnDateFrom)
        : undefined,
      returnDateTo: formValues.returnDateTo
        ? new Date(formValues.returnDateTo)
        : undefined,
    };

    this.dataService.updateFilters(filterUpdate);
  }
}
