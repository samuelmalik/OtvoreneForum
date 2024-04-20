import { Injectable } from '@angular/core';
import {inject, Inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private httpClient = inject(HttpClient);

  constructor(@Inject('BASE_URL') private baseUrl: string) {}

  getAllUsers(){
    return this.httpClient.get<UserDtoInterface[]>(this.baseUrl + '/forum/allUsers')
  }

  getAllPosts(){
    return this.httpClient.get<PostDtoInterface[]>(`${this.baseUrl}/forum/getAllPosts`)
  }

  createPost(data :any) {
    return this.httpClient.post(`${this.baseUrl}/forum/newPost`, data)
  }

}

 export interface PostDtoInterface {
  title: string;
  description: string;
  code: string
  author: string;
  date: string;
}

export interface UserDtoInterface {
  username: string;
}
