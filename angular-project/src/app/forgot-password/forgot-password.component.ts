import { Component, inject } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuthenticationService, ForgotPasswordResponse } from '../api-authorization/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatFormField} from "@angular/material/form-field";
import {MatAnchor, MatButton} from "@angular/material/button";
import {MatInput} from "@angular/material/input";
import { MatFormFieldModule } from '@angular/material/form-field';
import {NgIf, NgOptimizedImage} from "@angular/common";
import { MatCardModule } from '@angular/material/card';
import {RouterLink} from "@angular/router";



@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatFormField,
    MatButton,
    MatInput,
    NgOptimizedImage,
    MatCardModule,
    RouterLink,
    MatAnchor,
    NgIf
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  authService = inject(AuthenticationService);
  snackBar = inject(MatSnackBar);

  forgotPasswordForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  submit() {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.get('email')?.value;

      if (email) {
        this.authService.forgotPassword({ email }).subscribe({
          next: (response: ForgotPasswordResponse) => {
            this.snackBar.open(response.message, 'OK', { duration: 5000 });
          },
          error: () => {
            this.snackBar.open('Nepodarilo sa obnoviť heslo.', 'OK', { duration: 5000 });
          }
        });
      }
    }
  }
}
