import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../app/api-authorization/authentication.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: ''
})
export class EmailVerificationComponent implements OnInit {
  authService = inject(AuthenticationService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  snackBar = inject(MatSnackBar);

  loading = true;
  error = false;


  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email');
    const code = this.route.snapshot.queryParamMap.get('code');


    if (email && code) {
      this.authService.verifyEmail(email, code).subscribe({
        next: () => {
          this.snackBar.open('Email bol úspešne overený!', 'OK', { duration: 5000 });
          this.loading = false;
          this.router.navigate(['/']);
        },
        error: () => {
          this.snackBar.open('Overenie zlyhalo. Skontrolujte link a skúste znova.', 'OK', { duration: 5000 });
          this.loading = false;
          this.error = true;
        }
      });
    } else {
      this.snackBar.open('Overenie zlyhalo. Chýbajú údaje.', 'OK', { duration: 5000 });
      this.loading = false;
      this.error = true;
    }
  }
}
