import {Component, Inject, inject, OnInit} from '@angular/core';
import {CdkDragDrop,
  CdkDrag,
  CdkDragHandle,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,} from '@angular/cdk/drag-drop';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import { DeviceDetectorService } from 'ngx-device-detector';
import {GroupsService, GetGroupsDtoInterface, UserInfoDtoInterface, CreateGroupDtoInterface, AddUserToGroupDtoInterface} from "../services/groups.service";


@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CdkDropListGroup, CdkDropList, CdkDrag,CdkDragHandle, FormsModule, MatButton, ReactiveFormsModule, MatIcon, MatIconButton],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css'
})
export class GroupsComponent implements OnInit{
  private groupsService: GroupsService = inject(GroupsService);
  public groupsList :GetGroupsDtoInterface[]
  public unassignedUsers :UserInfoDtoInterface[]
  public newGroupName: string
  // po vymazaní skupiny cdkDrag neprepíše indexovanie, preto ich ťaháme znova z databáze a indexy shiftujeme
  public groupIndexShift = 0

  constructor(@Inject('BASE_URL') private baseUrl: string, private deviceService: DeviceDetectorService) {}

  get isMobile(): boolean {
    return this.deviceService.isMobile();
  }

  get isTablet(): boolean {
    return this.deviceService.isTablet();
  }

  get isDesktop(): boolean {
    return this.deviceService.isDesktop();
  }

  ngOnInit(){
    this.groupsService.getAllGroups().subscribe(
      data => this.groupsList = data
    );

    this.groupsService.getUnassignedUsers().subscribe(
      data => this.unassignedUsers = data
    )
  }

  onCreate(){
    let data: CreateGroupDtoInterface = {
      name: this.newGroupName
    }
    this.groupsService.createGroup(data).subscribe(data =>
    this.groupsList.push(data))
    console.log(this.groupsList)
    this.newGroupName = ""
  }

  onDelete(id: number){
    this.groupIndexShift = this.groupIndexShift + this.groupsList.length
    this.groupsService.deleteGroup(id).subscribe((data) =>
    {
      this.unassignedUsers = data
      this.groupsService.getAllGroups().subscribe(
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
        this.groupsService.addUserToGroup(data).subscribe()
      } else {
        let data: AddUserToGroupDtoInterface ={
          userId: movedUserId,
          groupId: -1
        }
        this.groupsService.addUserToGroup(data).subscribe()
      }

    }
  }


}
