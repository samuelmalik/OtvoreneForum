import {Component, Inject, inject, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";


@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css'
})
export class GroupsComponent implements OnInit{
  private http = inject(HttpClient);
  public groupsList :GetGroupsDtoInterface[]

  constructor(@Inject('BASE_URL') private baseUrl: string) {}

  ngOnInit(){
    this.http.get<GetGroupsDtoInterface[]>(this.baseUrl + '/group/getGroups').subscribe(
      data => this.groupsList = data
    )
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
