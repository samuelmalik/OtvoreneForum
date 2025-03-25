import { Component } from '@angular/core';
import { ForumService, UserDtoInterface} from "../services/forum.service";
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    NgIf,
    NgForOf
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  unapprovedUsers: UserDtoInterface[] = [];

  constructor(private forumService: ForumService) {}

  ngOnInit(): void {
    this.loadUnapprovedUsers();
  }

  loadUnapprovedUsers(): void {
    this.forumService.getUnapprovedUsers().subscribe(users => {
      this.unapprovedUsers = users;
      console.log("Nepotvrdení používatelia:", this.unapprovedUsers);
    });
  }

}
