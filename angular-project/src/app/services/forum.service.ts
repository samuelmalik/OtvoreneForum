import { Injectable } from '@angular/core';
import {Component, inject, Inject} from '@angular/core';
import {HttpParams} from "@angular/common/http";
import { HttpClient } from '@angular/common/http';
import {UserRegistration} from '../api-authorization/user-registration';
import {AuthenticationService} from "../api-authorization/authentication.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private httpClient = inject(HttpClient);

  constructor(@Inject('BASE_URL') private baseUrl: string) {

  }

  getAllUsers(){
    return this.httpClient.get<UserInterface[]>(this.baseUrl + '/forum/allUsers')
  }

}

 interface PostInterface {
  title: string;
  description: string;
  author: string;
  date: string;
}

export interface UserInterface {
  username: string;
}
