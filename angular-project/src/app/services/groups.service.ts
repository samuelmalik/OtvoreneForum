import { Injectable } from '@angular/core';
import {inject, Inject} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {UserDtoInterface} from "./forum.service";

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  private httpClient = inject(HttpClient);

  constructor(@Inject('BASE_URL') private baseUrl: string) { }

  getCurrentUserGroupId(id){
    let params = new HttpParams();
    params = params.append('userId', id);
    return this.httpClient.get<number>(this.baseUrl + '/group/getCurrentUserGroupId', {params: params})
  }

  getAllGroups(){
    return this.httpClient.get<GetGroupsDtoInterface[]>(this.baseUrl + '/group/getGroups')
  }

  getUnassignedUsers(){
    return this.httpClient.get<UserInfoDtoInterface[]>(this.baseUrl + '/group/unassignedUsers')
  }

  createGroup(data: CreateGroupDtoInterface){
    return this.httpClient.post<GetGroupsDtoInterface>(`${this.baseUrl}/group/newGroup`, data)
  }

  deleteGroup(id: number){
    let params = new HttpParams();
    params = params.append('groupId', id);
    return this.httpClient.delete<UserInfoDtoInterface[]>(`${this.baseUrl}/group/deleteGroup`, {params: params})
  }

  addUserToGroup(data: AddUserToGroupDtoInterface){
    return this.httpClient.put(`${this.baseUrl}/group/addUserToGroup`, data)
  }
}

export interface UserInfoDtoInterface{
  id: string
  username: string
  status: string
  role: string
}

export interface GetGroupsDtoInterface{
  id: number
  name: string
  users: UserInfoDtoInterface[]
  hasPosts: boolean
}

export interface AddUserToGroupDtoInterface{
  userId: string
  groupId: number
}

export interface CreateGroupDtoInterface{
  name: string
}
