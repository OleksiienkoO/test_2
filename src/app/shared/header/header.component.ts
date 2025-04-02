import { NgClass } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [NgClass],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private readonly router = inject(Router);

  isActiveRoute(route: string) {
    return this.router.url === route;
  }

  navigateToPage(route: string) {
    this.router.navigate([route]);
  }
}
