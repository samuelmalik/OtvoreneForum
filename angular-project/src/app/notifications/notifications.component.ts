import {Component, OnInit, inject, DestroyRef} from '@angular/core';
import {ForumService, NotificationInterface} from "../services/forum.service";
import {AuthenticationService} from "../api-authorization/authentication.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit{
  private currentUserId: string;
  private forumService: ForumService = inject(ForumService);
  private authService: AuthenticationService = inject(AuthenticationService);
  private destroyRef: DestroyRef = inject(DestroyRef);
  public notifications: NotificationInterface[] = [];


  ngOnInit() {
    console.log("funguje")
    this.currentUserId = this.authService.getCurrentId();

    this.forumService.getNotifications(this.currentUserId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data =>{
      this.notifications = data
    });
  }

  onRemoveNotification(type: string, id: number){
    const index = this.notifications.findIndex(notification => type == notification.type && id == notification.itemId)
    this.notifications.splice(index, 1);
    if (type == "comment"){
      this.forumService.makeCommentSeen(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe()
    } else if(type == "postLike"){
      this.forumService.makePostLikeSeen(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe()
    } else if(type == "commentLike"){
      this.forumService.makeCommentLikeSeen(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe()
    }
  }

}
