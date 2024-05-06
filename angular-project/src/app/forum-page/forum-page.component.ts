import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ForumService, UserDtoInterface, PostInfoDtoInterface, AddPostLikeInterface} from "../services/forum.service";
import {MatListModule} from '@angular/material/list';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {RouterLink} from "@angular/router";
import {AuthenticationService} from "../api-authorization/authentication.service";





@Component({
  selector: 'app-forum-page',
  standalone: true,
  imports: [
    MatListModule,
    MatProgressSpinner,
    RouterLink,


  ],
  templateUrl: './forum-page.component.html',
  styleUrl: './forum-page.component.css'
})
export class ForumPageComponent implements OnInit{
  private destroyRef = inject(DestroyRef);
  private forumService :ForumService = inject(ForumService);
  private authService :AuthenticationService = inject(AuthenticationService);
  private currentUserId :string;
  public postList: PostInfoDtoInterface[] = [];
  public userList: UserDtoInterface[] = [];
  public showPostsLoader = true;
  public showUsersLoader = true;


  ngOnInit() {
    this.currentUserId = this.authService.getCurrentId();
    this.forumService.getAllUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data =>{
      this.userList = data;
      this.showUsersLoader = false;
    });
    this.forumService.getAllPosts(this.currentUserId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.postList = data;
      this.showPostsLoader = false;
    });
  }

  onLike(postId: number){
    const index = this.postList.findIndex(post => post.id == postId)
    const likeData: AddPostLikeInterface = {
      userId: this.currentUserId,
      postId: postId
    }

    if(this.currentUserId == null){
      console.log("neprihlásený user");
    }else if(this.postList[index].isLiked == false){

      this.postList[index].isLiked = true
      this.postList[index].likes += 1
      this.forumService.addPostLike(likeData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data =>{})

    } else if(this.postList[index].isLiked == true){
      this.postList[index].isLiked = false
      this.postList[index].likes -= 1
      this.forumService.removePostLike(likeData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data =>{})
    }

  }

}




