import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthenticationService, ForgotPasswordResponse } from '../api-authorization/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RecaptchaModule } from "ng-recaptcha";
import {MatAnchor, MatButton} from "@angular/material/button";
import {RouterLink} from "@angular/router";
import {MatFormField, MatInput} from "@angular/material/input";
import {MatCard} from "@angular/material/card";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgIf, CommonModule } from '@angular/common';


@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RecaptchaModule,
    MatAnchor,
    RouterLink,
    MatButton,
    MatInput,
    MatFormField,
    MatCard,
    MatFormFieldModule,
    MatInputModule,
    NgIf,
    CommonModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  authService = inject(AuthenticationService);
  snackBar = inject(MatSnackBar);

  captcha: string = '';
  loading: boolean = false;

  forgotPasswordForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  resolved(captchaResponse: string) {
    this.captcha = captchaResponse;
    console.log('CAPTCHA resolved with token:', captchaResponse);
  }

  submit() {
    this.loading = true;
    if (this.forgotPasswordForm.valid && this.captcha) {
      const email = this.forgotPasswordForm.get('email')?.value;

      if (email) {
        this.authService.forgotPassword({ email, captchaToken: this.captcha }).subscribe({
          next: (response: ForgotPasswordResponse) => {
            this.snackBar.open(response.message, 'OK', { duration: 5000 });
            this.loading = false;
          },
          error: () => {
            this.snackBar.open('Nepodarilo sa obnoviť heslo.', 'OK', { duration: 5000 });
          }
        });
      }
    } else {
      this.snackBar.open('Please complete the CAPTCHA.', 'OK', { duration: 3000 });
    }
  }
}
