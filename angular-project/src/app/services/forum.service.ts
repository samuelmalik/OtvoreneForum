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
    return this.httpClient.get<UserDtoInterface[]>(this.baseUrl + '/user/allUsers')
  }

  getAllPosts(userId: string){
    let params = new HttpParams();
    params = params.append('currentUserId', userId);
    return this.httpClient.get<PostInfoDtoInterface[]>(`${this.baseUrl}/forum/getAllPosts`, {params: params})
  }

  getPostDetails(postId: number, userId: string){
    let params = new HttpParams();
    params = params.append('postId', postId);
    params = params.append('currentUserId', userId);
    return this.httpClient.get<PostDetailsDtoInterface>(`${this.baseUrl}/forum/getPostDetails`, {params: params})
  }

  getCommentsByPost(userId: string, postId: number){
    let params = new HttpParams();
    params = params.append('postId', postId);
    params = params.append('currentUserId', userId);

    return this.httpClient.get<CommentInfoInterface[]>(`${this.baseUrl}/forum/getCommentsByPost`, {params: params})
  }

  createPost(data :any) {
    return this.httpClient.post(`${this.baseUrl}/forum/newPost`, data)
  }

  createComment(data :any) {
    return this.httpClient.post<CommentInfoInterface>(`${this.baseUrl}/forum/newComment`, data)
  }

  addPostLike(data :any) {
    return this.httpClient.post<AddPostLikeInterface>(`${this.baseUrl}/forum/addPostLike`, data)
  }

  removePostLike(data :any) {
    return this.httpClient.post<AddPostLikeInterface>(`${this.baseUrl}/forum/removePostLike`, data)
  }

  addCommentLike(data :any) {
    return this.httpClient.post<AddCommentLikeInterface>(`${this.baseUrl}/forum/addCommentLike`, data)
  }

  removeCommentLike(data :any) {
    return this.httpClient.post<AddCommentLikeInterface>(`${this.baseUrl}/forum/removeCommentLike`, data)
  }

  getNotifications(userId: string){
    let params = new HttpParams();
    params = params.append('currentUserId', userId);
    return this.httpClient.get<NotificationInterface[]>(`${this.baseUrl}/forum/getNotifications`, {params: params})
  }

  hasNotifications(userId: string){
    let params = new HttpParams();
    params = params.append('currentUserId', userId);
    return this.httpClient.get<boolean>(`${this.baseUrl}/forum/hasNotifications`, {params: params})
  }

  makeCommentSeen(data :any) {
    return this.httpClient.put(`${this.baseUrl}/forum/makeCommentSeen`, data)
  }
  makePostLikeSeen(data :any) {
    return this.httpClient.put(`${this.baseUrl}/forum/makePostLikeSeen`, data)
  }
  makeCommentLikeSeen(data :any) {
    return this.httpClient.put(`${this.baseUrl}/forum/makeCommentLikeSeen`, data)
  }

  getStatus(userId: string){
    let params = new HttpParams();
    params = params.append('currentUserId', userId);
    return  this.httpClient.get<CurrentUserDetailsInterface>(`${this.baseUrl}/forum/getStatus`, {params: params})
  }

  updateStatus(data :UpdateStatusInterface) {
    return this.httpClient.put(`${this.baseUrl}/forum/updateStatus`, data)
  }

  public deletePost(data: number){
    let params = new HttpParams();
    params = params.append('postId', data);
    return this.httpClient.delete(`${this.baseUrl}/forum/deletePost`, {params: params})
  }



}

 export interface PostInfoDtoInterface {
  id: number;
  title: string;
  description: string;
  author: string;
  date: string;
  likes: number;
  isLiked: boolean;
}

export interface PostDetailsDtoInterface {
  title: string;
  description: string;
  author: string;
  authorId: string;
  date: string;
  code: string;
  likes: number;
  isLiked: boolean;
}

export interface UserDtoInterface {
  id: string;
  username: string;
  status: string;
  role: string;
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
  id: number;
  date: string;
  likes: number;
  isLiked: boolean;
}

export interface AddPostLikeInterface{
  userId: string;
  postId: number;
}

export interface AddCommentLikeInterface{
  userId: string;
  commentId: number;
}

export interface NotificationInterface{
  postId: number;
  postTitle: string;
  type: string;
  authorUsername: string;
  createTime: string;
  itemId: number;
}

export interface CurrentUserDetailsInterface{
  status: string;
}

export interface UpdateStatusInterface{
  userId: string;
  status: string;
}
