import {Component, DestroyRef, inject, Inject, OnInit} from '@angular/core';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ForumService, UserDtoInterface, PostInfoDtoInterface} from "../services/forum.service";
import {MatListModule} from '@angular/material/list';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {RouterLink} from "@angular/router";


@Component({
  selector: 'app-forum-page',
  standalone: true,
  imports: [
    MatListModule,
    MatProgressSpinner,
    RouterLink
  ],
  templateUrl: './forum-page.component.html',
  styleUrl: './forum-page.component.css'
})
export class ForumPageComponent implements OnInit{
  private destroyRef = inject(DestroyRef);
  private forumService :ForumService = inject(ForumService);
  public postList: PostInfoDtoInterface[] = [];
  public userList: UserDtoInterface[] = [];
  public showPostsLoader = true;
  public showUsersLoader = true;


  ngOnInit() {
    this.forumService.getAllUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data =>{
      this.userList = data;
      this.showUsersLoader = false;
    });
    this.forumService.getAllPosts().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.postList = data;
      this.showPostsLoader = false;
    });


  }
}




