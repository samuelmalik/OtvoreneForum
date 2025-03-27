import { Component } from '@angular/core';
import { ForumService, UserDtoInterface } from "../services/forum.service";
import { NgForOf, NgIf } from "@angular/common";
import { AuthenticationService} from "../api-authorization/authentication.service";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [NgIf, NgForOf],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  unapprovedUsers: UserDtoInterface[] = [];

  constructor(private forumService: ForumService, private authService: AuthenticationService) {}

  ngOnInit(): void {
    this.loadUnapprovedUsers();
  }

  loadUnapprovedUsers(): void {
    this.forumService.getUnapprovedUsers().subscribe(users => {
      this.unapprovedUsers = users;
    });
  }

  deleteUser(id: string): void {
    this.authService.deleteUser(id).subscribe(() => {
      this.unapprovedUsers = this.unapprovedUsers.filter(user => user.id !== id);
    }, error => {
      this.unapprovedUsers = this.unapprovedUsers.filter(user => user.id !== id);
    });
  }
}
