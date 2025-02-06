import {Component, DestroyRef, inject, OnInit, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ForumService, UserDtoInterface, PostInfoDtoInterface, AddPostLikeInterface} from "../services/forum.service";
import {MatListModule} from '@angular/material/list';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatMenuModule} from "@angular/material/menu";
import {RouterLink} from "@angular/router";
import {AuthenticationService} from "../api-authorization/authentication.service";
import {SharedService} from "../services/shared.service";
import {SearchPipe} from "../pipes/search.pipe";
import {FormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatDialogModule, MatDialog} from '@angular/material/dialog';
import { UserInfoDialogComponent } from '../user-info-dialog/user-info-dialog.component';
import {SignalrService} from "../services/signalr.service";
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {MatIcon} from "@angular/material/icon";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-forum-page',
  standalone: true,
  imports: [
    MatListModule,
    MatProgressSpinner,
    RouterLink,
    SearchPipe,
    FormsModule,
    MatMenuModule,
    MatButtonModule,
    MatDialogModule,
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    MatIcon,
    NgClass
  ],
  templateUrl: './forum-page.component.html',
  styleUrl: './forum-page.component.css'
})
export class ForumPageComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private forumService: ForumService = inject(ForumService);
  private authService: AuthenticationService = inject(AuthenticationService);
  private sharedService: SharedService = inject(SharedService);
  private signalRService: SignalrService = inject(SignalrService);
  private dialog = inject(MatDialog);
  private breakpointObserver = inject(BreakpointObserver);

  subscription: Subscription;
  subscription2: Subscription;
  @ViewChild('sideNav') sideNav: MatSidenav;

  private currentUserId: string;
  public postList: PostInfoDtoInterface[] = [];
  public userList: UserDtoInterface[] = [];
  public showPostsLoader = true;
  public showUsersLoader = true;
  public searchText: string;
  public orderBy: string;
  role = this.authService.role;

  public sidenavMode: 'over' | 'side' = 'side';
  public isMobile = false;

  ngOnInit() {
    this.currentUserId = this.authService.getCurrentId();
    this.forumService.getAllUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.userList = data.sort((a, b) => a.role < b.role ? -1 : 1);
      this.showUsersLoader = false;
    });

    this.forumService.getAllPosts(this.currentUserId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.postList = data;
      this.orderBy = "Od najnovšieho"
      this.postList.sort((a, b) => b.id - a.id);
      this.showPostsLoader = false;
    });

    this.subscription = this.sharedService.data$.subscribe(data => {
      console.log(data);
      this.updateRole(data.role, data.userId);
    });

    this.subscription2 = this.sharedService.deletedUserId$.subscribe(data => {
      console.log(data);
      this.updateUsersList(data);
    });




  }

  toggleSideNav() {
    this.sideNav.toggle();
  }


  onLike(postId: number) {
    const index = this.postList.findIndex(post => post.id == postId)
    const likeData: AddPostLikeInterface = {
      userId: this.currentUserId,
      postId: postId
    }

    if (this.currentUserId == null) {
      console.log("neprihlásený user");
    } else if (this.postList[index].isLiked == false) {

      this.postList[index].isLiked = true
      this.postList[index].likes += 1
      this.forumService.addPostLike(likeData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
        this.signalRService.newNotificationBroadcast();
      })

    } else if (this.postList[index].isLiked == true) {
      this.postList[index].isLiked = false
      this.postList[index].likes -= 1
      this.forumService.removePostLike(likeData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      })
    }
  }

  changeOrder(order: string) {
    if (order == "newest") {
      this.orderBy = "Od najnovšieho"
      this.postList.sort((a, b) => b.id - a.id)
    } else if (order == "oldest") {
      this.orderBy = "Od najstaršieho"
      this.postList.sort((a, b) => a.id - b.id)
    } else if (order == "most-liked") {
      this.orderBy = "Od najobľúbenejších"
      this.postList.sort((a, b) => b.likes - a.likes)
    } else if (order == "least-liked") {
      this.orderBy = "Od najmenej obľúbených"
      this.postList.sort((a, b) => a.likes - b.likes)
    }
  }

  openUserInfo(user: UserDtoInterface) {
    this.dialog.open(UserInfoDialogComponent, {
      data: user,
      width: '40vw',
      height: 'auto',
      panelClass: 'custom-dialog-container',
    });
  }

  updateRole(role: string, id: string) {
    for (let user of this.userList) {
      if (id == user.id) {
        user.role = role;
      }
    }
    this.userList = this.userList.sort((a, b) => a.role < b.role ? -1 : 1);
  }

  updateUsersList(id: string){
    console.log("správa z forum komponentu, id je: " + id)
    this.userList = this.userList.filter(item => item.id != id)
  }
}

