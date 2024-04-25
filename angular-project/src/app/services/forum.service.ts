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
    let params = new HttpParams();
    params = params.append('id', id);
    return this.httpClient.get<PostDetailsDtoInterface>(`${this.baseUrl}/forum/getPostDetails`, {params: params})
  }

  getCommentsByPost(userId: string, postId: number){
    let params = new HttpParams();
    params = params.append('postId', postId);

    return this.httpClient.get<CommentInfoInterface[]>(`${this.baseUrl}/forum/getCommentsByPost`, {params: params})
  }

  createPost(data :any) {
    return this.httpClient.post(`${this.baseUrl}/forum/newPost`, data)
  }

  createComment(data :any) {
    return this.httpClient.post<CommentInfoInterface>(`${this.baseUrl}/forum/newComment`, data)
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

export interface CreateCommentInterface{
  message: string;
  code: string;
  authorId: string;
  postId: number;
}

export interface CommentInfoInterface{
  message: string;
  code: string;
  author: string;
  postId: number;
  date: string;
}
