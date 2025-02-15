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
  errorMessage: string;
  showErrorMessage: boolean;

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', passwordStrengthValidator()),
      confirmPassword: new FormControl('', equalValuesValidator('password')),
    });

    this.errorMessage = "";
  }

  register() {
    this.errorMessage = ""
    if (this.registerForm.valid && this.captcha) {
      this.showLoader = true;


      const registrationData: UserRegistration = {
        ...this.registerForm.value,
        captchaToken: this.captcha,
      };

      this.captcha ="";
      this.authService.registerUser(registrationData).subscribe(
        data =>{
          console.log(data)
          if(data.isSuccessfulRegistration){
            this.showLoader = false;
            this.snackBar.open('Na váš email bol odoslaný overovací link.', 'OK', {
              duration: 5000,
              verticalPosition: 'bottom',
              horizontalPosition: 'center',
            });
            this.router.navigate(['/']);
            console.log(data)
          } else{
            this.showLoader = false;
            this.errorMessage = data.errors[0]
          }
        });
    } else if (!this.captcha) {
      this.snackBar.open('Prosím overte, že ste človek pomocou reCAPTCHA.', 'OK', {
        duration: 5000,
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
      });
    } else if (!this.registerForm.valid){
      if(this.registerForm.get('email')?.errors){
        this.errorMessage = "Nesprávny formát e-mailu"
      }
      else if(this.registerForm.get('password')?.errors){
        this.errorMessage = "Heslo musí byť aspoň 6 znakov dlhé, obsahovať malé, veľké písmená, číslo a špeciálny znak"
      }
      else if(this.registerForm.get('confirmPassword')?.errors){
        this.errorMessage = "Heslá sa nezhodujú"
      }
    }
  }

  resolved(captchaResponse: string) {
    this.captcha = captchaResponse;
  }
}


