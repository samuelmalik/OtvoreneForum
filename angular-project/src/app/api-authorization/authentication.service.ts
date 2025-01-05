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

  role = signal(this.getRole());

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

  changePassword(data: ChangePasswordInterface){
    return this.httpClient.post<ChangePasswordResponse>(`${this.baseUrl}/user/changePassword`, data)
  }

  changeUsername(data: ChangePasswordInterface){
    return this.httpClient.post<any>(`${this.baseUrl}/user/changeUsername`, data)
  }

  storeUserCredentials(token: string, username: string, id: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('id', id)
    this.authenticated.set(true);

    this.role.set(this.roleInfo(token));
  }

  private roleInfo(token: string): string {
    const decodedToken = this.jwtHelper.decodeToken(token);
    return decodedToken['role'];
  }

  getCurrentUsername(): string {
    return this.isAuthenticated() ? localStorage.getItem('username') : null;
  }

  getCurrentId(): string {
    return this.isAuthenticated() ? localStorage.getItem('id') : null;
  }

  isAuthenticated() {
    const token = localStorage.getItem("token");
    return token && !this.jwtHelper.isTokenExpired(token);
  }

  // getting role of current logged user
  getRole(): string{
    const token = localStorage.getItem("token");
    const decodedToken = this.jwtHelper.decodeToken(token);
    if(this.isAuthenticated()){
      return decodedToken['role']
    } else{
      return "student"
    }
  }

  setRole(data: AddClaimInterface){
    return this.httpClient.post<string>(`${this.baseUrl}/user/changeRole`, data)
  }

  getNote(creatorId: string, addresserId: string){
    let queryParams = new HttpParams();
    queryParams = queryParams.append("creatorId",creatorId);
    queryParams = queryParams.append("addresserId",addresserId);

    return this.httpClient.get<NoteInterface>(`${this.baseUrl}/user/getNote`,{params:queryParams});
  }

  setNote(data: UpdateNoteInterface){
    return this.httpClient.put<string>(`${this.baseUrl}/user/setNote`, data)
  }
  verifyEmail(email: string, code: string): Observable<any> {
    const params = new HttpParams()
      .set('email', email)
      .set('code', code);

    return this.httpClient.get(`${this.baseUrl}/user/EmailVerification`, { params });
  }
}

export interface ChangePasswordInterface{
  id: string;
  oldPassword: string;
  newPassword: string
}

export interface ChangePasswordResponse{
  errorMessage: string;
}

export interface AddClaimInterface{
  userId: string;
  type: string;
  value: string;
}

export interface NoteInterface{
  note: string;
}

export interface UpdateNoteInterface{
  creatorId: string;
  addresserId: string;
  text: string;
}
