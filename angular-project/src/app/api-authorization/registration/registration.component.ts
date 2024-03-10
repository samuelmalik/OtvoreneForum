import { Component, inject, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { HttpErrorResponse } from '@angular/common/http';
import { equalValuesValidator, passwordStrengthValidator } from '../password-validators';
import { Router } from '@angular/router';
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    MatIconButton,
    MatButton,
    MatProgressSpinner
  ],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent implements OnInit {
  authService = inject(AuthenticationService);
  private router = inject(Router);
  showLoader :boolean = false;

  registerForm: FormGroup;

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', passwordStrengthValidator()),
      confirmPassword: new FormControl('', equalValuesValidator('password'))
    });
  }

  register() {
    if(this.registerForm.valid) {
      this.showLoader = true;
      this.authService.registerUser({...this.registerForm.value}).subscribe({
        next: () => {
          console.log('Registration successful!');
          this.showLoader = false;
          this.router.navigate(['/']);
        },
        error: (err: HttpErrorResponse) => console.log('Oops, something went wrong!', err)
      });
    }
  }
}
