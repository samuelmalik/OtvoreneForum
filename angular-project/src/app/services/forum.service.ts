import { Injectable } from '@angular/core';
import {inject, Inject} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

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
    return this.httpClient.get<PostInfoDtoInterface[]>(`${this.baseUrl}/forum/getAllPosts`)
  }

  getPostDetails(id: number){
    const options = id.toString() ?
      { params: new HttpParams().set('id', id.toString()) } : {};
    return this.httpClient.get<PostDetailsDtoInterface>(`${this.baseUrl}/forum/getPostDetails`, options)
  }

  createPost(data :any) {
    return this.httpClient.post(`${this.baseUrl}/forum/newPost`, data)
  }

}

 export interface PostInfoDtoInterface {
  id: number;
  title: string;
  description: string;
  author: string;
  date: string;
}

export interface PostDetailsDtoInterface {
  title: string;
  description: string;
  author: string;
  date: string;
  code: string;
}

export interface UserDtoInterface {
  username: string;
}
