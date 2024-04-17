import {Component, inject, Inject} from '@angular/core';
import {HttpParams} from "@angular/common/http";
import { HttpClient } from '@angular/common/http';
import {FormBuilder, Validators} from "@angular/forms";
import {UserRegistration} from '../api-authorization/user-registration';
import {AuthenticationService} from "../api-authorization/authentication.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ForumService, UserInterface} from "../services/forum.service";
import {MatListModule} from '@angular/material/list';


@Component({
  selector: 'app-forum-page',
  standalone: true,
  imports: [
    MatListModule,

  ],
  templateUrl: './forum-page.component.html',
  styleUrl: './forum-page.component.css'
})
export class ForumPageComponent {
  private httpClient = inject(HttpClient);
  private authServie :AuthenticationService = inject(AuthenticationService);
  private forumService :ForumService = inject(ForumService);
  public postList: PostInterface[] = [];
  public userList: UserInterface[] = [];

  constructor( @Inject('BASE_URL') private baseUrl: string) {
    this.forumService.getAllUsers().subscribe(data =>{
      this.userList = data;
    });

    this.httpClient.get<PostInterface[]>(`${this.baseUrl}/forum/getAllPosts`).pipe(takeUntilDestroyed()).subscribe(data => {
      this.postList = data;

    });

  }


}

interface PostInterface {
  title: string;
  description: string;
  author: string;
  date: string;
}




