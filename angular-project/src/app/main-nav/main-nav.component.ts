import {Component, inject, OnDestroy, OnInit, DestroyRef} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import {MatButton} from "@angular/material/button";
import {MatGridListModule} from '@angular/material/grid-list';
import { AuthenticationService } from '../api-authorization/authentication.service';
import {AsyncPipe, NgIf, NgOptimizedImage} from '@angular/common';
import {MatSnackBar, MatSnackBarConfig, MAT_SNACK_BAR_DATA, MatSnackBarRef} from "@angular/material/snack-bar";
import {MatMenuModule} from '@angular/material/menu';
import {ForumService} from "../services/forum.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";


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
    MatMenuModule,
    AsyncPipe
  ],
  templateUrl: './main-nav.component.html',
  styleUrl: './main-nav.component.css'
})
export class MainNavComponent implements OnInit{
  public authService = inject(AuthenticationService);
  private forumService :ForumService = inject(ForumService);
  private destroyRef :DestroyRef = inject(DestroyRef)
  private router = inject(Router);
  public hasNotifications: boolean = false;
  configSuccess: MatSnackBarConfig = {
    panelClass: 'style-success',
    horizontalPosition: 'center',
    verticalPosition: 'top',

  };

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    console.log("navigacia vytvorena");
    this.forumService.hasNotifications(this.authService.getCurrentId()).subscribe(data =>{
      this.hasNotifications = data;
    })
  }

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

