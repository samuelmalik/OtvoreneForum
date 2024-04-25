import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import {MatButton} from "@angular/material/button";
import {MatGridListModule} from '@angular/material/grid-list';
import { AuthenticationService } from '../api-authorization/authentication.service';
import {NgIf, NgOptimizedImage} from '@angular/common';
import {Inject} from "@angular/core";
import {MatSnackBar, MatSnackBarConfig, MAT_SNACK_BAR_DATA, MatSnackBarRef} from "@angular/material/snack-bar";
import {MatMenuModule} from '@angular/material/menu';


@Component({
  selector: 'app-main-nav',
  standalone: true,
  imports: [
    RouterLink,
    MatToolbar,
    MatButton,
    MatGridListModule,
    NgIf,
    NgOptimizedImage,
    MatMenuModule
  ],
  templateUrl: './main-nav.component.html',
  styleUrl: './main-nav.component.css'
})
export class MainNavComponent {
  authService = inject(AuthenticationService);
  private router = inject(Router);
  configSuccess: MatSnackBarConfig = {
    panelClass: 'style-success',
    horizontalPosition: 'center',
    verticalPosition: 'top',

  };

  constructor(private snackBar: MatSnackBar) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  createPost() {
    if (this.authService.isAuthenticated()){
      this.router.navigate(['/create-post'])
    } else {
      this.snackBar.openFromComponent(CreatePostNavSnackComponent, {
        ...this.configSuccess,
      });
    }
  }
}

@Component({
  selector: 'main-nav-snack',
  templateUrl: 'main-nav-snack.html',
  imports: [
    MatButton
  ],
  standalone: true
})
export class CreatePostNavSnackComponent {
  private router = inject(Router);
  constructor(
    public snackBarRef: MatSnackBarRef<CreatePostNavSnackComponent>,
  ) {}


  onClick() {
    this.snackBarRef.dismiss()
    this.router.navigate(['/login'])
  }
}

