import { Component, inject, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { AsyncPipe } from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {SharedService} from "../../services/shared.service";

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
  errorMessage: string;


  loginForm: FormGroup;


  constructor(private sharedService:SharedService) {
  }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', Validators.required)
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.showLoader = true;

      this.authService.loginUser({...this.loginForm.value}).subscribe({
        next: (response) => {
          if(response.isAuthSuccessful){
            this.authService.storeUserCredentials(response.token, response.username, response.id);
            this.showLoader = false;
            this.sharedService.sendClickEvent();
            this.router.navigate(['/forum']);
          } else {
            this.showLoader = false;
            this.errorMessage  = response.errorMessage
          }

        },
        error: (err) => console.log("Niečo sa pokazilo", err)
      });
    }
  }
}
