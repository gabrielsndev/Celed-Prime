import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/components/header/header.component";
import { filter } from 'rxjs';

@Component({
  selector: 'cp-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('celed-prime-web');

  private router = inject(Router);
  
  showHeader = true;

  constructor() {

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      
      const hiddenRoutes = ['/login', '/reset/senha'];
      const currentPath = event.urlAfterRedirects.split('?')[0];
      const shouldHide = hiddenRoutes.some(route => currentPath.startsWith(route));
      this.showHeader = !shouldHide;

    })
  }
}