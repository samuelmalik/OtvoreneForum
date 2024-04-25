import { Component, inject, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { AsyncPipe } from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatButton,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    AsyncPipe,
    MatProgressSpinner,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  authService = inject(AuthenticationService);
  private router = inject(Router);
  showLoader :boolean = false
  errorMessage :boolean = false;

  loginForm: FormGroup;

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', Validators.required)
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.showLoader = true;
      this.errorMessage = false;

      this.authService.loginUser({...this.loginForm.value}).subscribe({
        next: (response) => {
          if(response.isAuthSuccessful){
            this.authService.storeUserCredentials(response.token, response.username, response.id);
            this.showLoader = false;
            this.router.navigate(['/forum']);
          } else {
            this.showLoader = false;
            this.errorMessage = true;
          }

        },
        error: (err) => console.log("Oops, something went wrong", err)
      });
    }
  }
}
