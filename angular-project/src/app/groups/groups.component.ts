import {Component, Inject, inject, OnInit} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,} from '@angular/cdk/drag-drop';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButton, MatIconButton} from "@angular/material/button";
import {AddCommentLikeInterface} from "../services/forum.service";
import {MatIcon} from "@angular/material/icon";


@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CdkDropListGroup, CdkDropList, CdkDrag, FormsModule, MatButton, ReactiveFormsModule, MatIcon, MatIconButton],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css'
})
export class GroupsComponent implements OnInit{
  private http = inject(HttpClient);
  public groupsList :GetGroupsDtoInterface[]
  public unassignedUsers :UserInfoDtoInterface[]
  public newGroupName: string
  // po vymazaní skupiny cdkDrag neprepíše indexovanie, preto ich ťaháme znova z databáze a indexy shiftujeme
  public groupIndexShift = 0

  constructor(@Inject('BASE_URL') private baseUrl: string) {}

  ngOnInit(){
    this.http.get<GetGroupsDtoInterface[]>(this.baseUrl + '/group/getGroups').subscribe(
      data => this.groupsList = data
    );

    this.http.get<UserInfoDtoInterface[]>(this.baseUrl + '/group/unassignedUsers').subscribe(
      data => this.unassignedUsers = data
    )
  }

  onCreate(){
    let data: CreateGroupDtoInterface = {
      name: this.newGroupName
    }
    this.http.post<GetGroupsDtoInterface>(`${this.baseUrl}/group/newGroup`, data).subscribe(data =>
    this.groupsList.push(data))
    console.log(this.groupsList)
    this.newGroupName = ""
  }

  onDelete(id: number){
    this.groupIndexShift = this.groupIndexShift + this.groupsList.length
    let params = new HttpParams();
    params = params.append('groupId', id);
    this.http.delete<UserInfoDtoInterface[]>(`${this.baseUrl}/group/deleteGroup`, {params: params}).subscribe((data) =>
    {
      this.unassignedUsers = data
      this.http.get<GetGroupsDtoInterface[]>(this.baseUrl + '/group/getGroups').subscribe(
        (data) => {this.groupsList = data
        });
    })

    //let deletedGroupIndex = this.groupsList.findIndex(g => g.id == id)
    //this.groupsList.splice(deletedGroupIndex, 1)

  }

  drop(event: CdkDragDrop<UserInfoDtoInterface[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      let movedUserId = event.container.data[event.currentIndex].id
      let groupIndex: number = Number(event.container.id.substring(14))-1-this.groupIndexShift

      //checking if moving user in group or making him unassigned
      if(groupIndex >= 0){
        let groupId: number = this.groupsList[groupIndex].id

        let data: AddUserToGroupDtoInterface ={
          userId: movedUserId,
          groupId: groupId
        }
        this.http.put(`${this.baseUrl}/group/addUserToGroup`, data).subscribe()
      } else {
        let data: AddUserToGroupDtoInterface ={
          userId: movedUserId,
          groupId: -1
        }
        this.http.put(`${this.baseUrl}/group/addUserToGroup`, data).subscribe()
      }

    }
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
}

export interface AddUserToGroupDtoInterface{
  userId: string
  groupId: number
}

export interface CreateGroupDtoInterface{
  name: string
}
