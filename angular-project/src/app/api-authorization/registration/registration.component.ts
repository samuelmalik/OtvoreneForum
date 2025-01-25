import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../authentication.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { HttpErrorResponse } from '@angular/common/http';
import { equalValuesValidator, passwordStrengthValidator } from '../password-validators';
import { Router, RouterLink } from '@angular/router';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RecaptchaModule } from "ng-recaptcha";
import { UserRegistration } from '../user-registration';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    MatIconButton,
    MatButton,
    MatProgressSpinner,
    RouterLink,
    MatSnackBarModule,
    RecaptchaModule,
  ],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
})
export class RegistrationComponent implements OnInit {
  authService = inject(AuthenticationService);
  private router = inject(Router);
  showLoader: boolean = false;
  snackBar = inject(MatSnackBar);

  captcha: string = '';
  registerForm: FormGroup;

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', passwordStrengthValidator()),
      confirmPassword: new FormControl('', equalValuesValidator('password')),
    });
  }

  register() {
    if (this.registerForm.valid && this.captcha) {
      this.showLoader = true;


      const registrationData: UserRegistration = {
        ...this.registerForm.value,
        captchaToken: this.captcha,
      };

      // Volanie služby na registráciu
      this.authService.registerUser(registrationData).subscribe({
        next: () => {
          this.showLoader = false;
          this.snackBar.open('Na váš email bol odoslaný overovací link.', 'OK', {
            duration: 5000,
            verticalPosition: 'bottom',
            horizontalPosition: 'center',
          });
          this.router.navigate(['/']);
        },
        error: (err: HttpErrorResponse) => {
          this.showLoader = false;
          this.snackBar.open('Registrácia zlyhala. Skontrolujte údaje a skúste znova.', 'OK', {
            duration: 5000,
            verticalPosition: 'bottom',
            horizontalPosition: 'center',
          });
          console.error('Oops, something went wrong!', err);
        },
      });
    } else if (!this.captcha) {
      this.snackBar.open('Prosím overte, že ste človek pomocou reCAPTCHA.', 'OK', {
        duration: 5000,
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
      });
    }
  }

  resolved(captchaResponse: string) {
    this.captcha = captchaResponse;
    console.log('reCAPTCHA resolved, token:', this.captcha);
  }
}


