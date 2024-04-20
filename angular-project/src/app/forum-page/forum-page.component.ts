import {Component, DestroyRef, inject, Inject, OnInit} from '@angular/core';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ForumService, UserInterface, PostInterface} from "../services/forum.service";
import {MatListModule} from '@angular/material/list';


@Component({
  selector: 'app-forum-page',
  standalone: true,
  imports: [
    MatListModule,

  ],
  templateUrl: './forum-page.component.html',
  styleUrl: './forum-page.component.css'
})
export class ForumPageComponent implements OnInit{
  private destroyRef = inject(DestroyRef);
  private forumService :ForumService = inject(ForumService);
  public postList: PostInterface[] = [];
  public userList: UserInterface[] = [];


  ngOnInit() {
    this.forumService.getAllUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data =>{
      this.userList = data;
    });
    this.forumService.getAllPosts().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.postList = data;
    });
  }
}




