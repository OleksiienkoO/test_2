// metrics-tabs.component.ts
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-metrics-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: `./metrics-tabs.component.html`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricsTabsComponent {
  activeTab = input('total-loans');
  tabSelected = output<string>();

  onTabSelect(tabId: string): void {
    this.tabSelected.emit(tabId);
  }
}
