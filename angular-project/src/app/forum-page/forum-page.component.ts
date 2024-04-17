import {Component, inject, Inject} from '@angular/core';
import {HttpParams} from "@angular/common/http";
import { HttpClient } from '@angular/common/http';
import {FormBuilder, Validators} from "@angular/forms";
import {UserRegistration} from '../api-authorization/user-registration';
import {AuthenticationService} from "../api-authorization/authentication.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ForumService} from "../services/forum.service";

@Component({
  selector: 'app-forum-page',
  standalone: true,
  imports: [],
  templateUrl: './forum-page.component.html',
  styleUrl: './forum-page.component.css'
})
export class ForumPageComponent {
  private httpClient = inject(HttpClient);
  private authServie :AuthenticationService = inject(AuthenticationService);
  private forumService :ForumService = inject(ForumService);

  constructor( @Inject('BASE_URL') private baseUrl: string) {
    this.forumService.getAllUsers().subscribe(data =>{
      console.log(data[2].username);
    });

    this.httpClient.get<PostInterface>(`${this.baseUrl}/forum/getAllPosts`).pipe(takeUntilDestroyed()).subscribe(data => {
      console.log(data);
    });

  }


}

interface PostInterface {
  title: string;
  description: string;
  author: string;
  date: string;
}




