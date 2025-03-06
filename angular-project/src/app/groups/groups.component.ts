import {Component, Inject, inject, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,} from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CdkDropListGroup, CdkDropList, CdkDrag],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css'
})
export class GroupsComponent implements OnInit{
  private http = inject(HttpClient);
  public groupsList :GetGroupsDtoInterface[]
  public unassignedUsers :UserInfoDtoInterface[]

  constructor(@Inject('BASE_URL') private baseUrl: string) {}

  ngOnInit(){
    this.http.get<GetGroupsDtoInterface[]>(this.baseUrl + '/group/getGroups').subscribe(
      data => this.groupsList = data
    );

    this.http.get<UserInfoDtoInterface[]>(this.baseUrl + '/group/unassignedUsers').subscribe(
      data => this.unassignedUsers = data
    )
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
      let groupIndex: number = Number(event.container.id.substring(14))-1

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
