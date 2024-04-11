import { inject, Inject, Injectable, signal } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistrationResponse, UserLogin, UserLoginResponse, UserRegistration } from './user-registration';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private httpClient = inject(HttpClient);
  private jwtHelper = inject(JwtHelperService);



  authenticated = signal(this.isAuthenticated());

  constructor(@Inject('BASE_URL') private baseUrl: string) {  }

  registerUser(userData: UserRegistration): Observable<RegistrationResponse> {
    return this.httpClient.post<RegistrationResponse>(this.baseUrl + '/user/register', userData);
  }

  loginUser(userData: UserLogin): Observable<UserLoginResponse> {
    return this.httpClient.post<UserLoginResponse>(this.baseUrl + '/user/login', userData);
  }

  logout() {
    localStorage.removeItem("token");
    this.authenticated.set(false);
  }

  storeUserCredentials(token: string, username: string, id: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('id', id)
    this.authenticated.set(true);
  }

  getCurrentUsername(): string {
    return this.isAuthenticated() ? localStorage.getItem('username') : null;
  }

  getCurrentId(): string {
    return this.isAuthenticated() ? localStorage.getItem('id') : null;
  }

  private isAuthenticated() {
    const token = localStorage.getItem("token");

    return token && !this.jwtHelper.isTokenExpired(token);
  }
}
