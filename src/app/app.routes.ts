import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/main-table-page/main-table-page.component').then(
        (res) => res.MainTablePageComponent
      ),
  },
  {
    path: 'short_information',
    loadComponent: () =>
      import(
        './pages/short-information-page/short-information-page.component'
      ).then((res) => res.ShortInformationPageComponent),
  },
];
