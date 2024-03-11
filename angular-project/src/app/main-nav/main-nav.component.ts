import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import {MatGridListModule} from '@angular/material/grid-list';
import { AuthenticationService } from '../api-authorization/authentication.service';
import {NgIf, NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-main-nav',
  standalone: true,
  imports: [
    RouterLink,
    MatToolbar,
    MatButton,
    MatGridListModule,
    NgIf,
    NgOptimizedImage
  ],
  templateUrl: './main-nav.component.html',
  styleUrl: './main-nav.component.css'
})
export class MainNavComponent {
  authService = inject(AuthenticationService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
