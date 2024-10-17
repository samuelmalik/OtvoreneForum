import {
  Component,
  inject,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import {MatButton} from "@angular/material/button";
import {MatGridListModule} from '@angular/material/grid-list';
import { AuthenticationService } from '../api-authorization/authentication.service';
import {AsyncPipe, NgIf, NgOptimizedImage} from '@angular/common';
import {MatSnackBar, MatSnackBarConfig, MAT_SNACK_BAR_DATA, MatSnackBarRef} from "@angular/material/snack-bar";
import {MatMenuModule} from '@angular/material/menu';
import {ForumService} from "../services/forum.service";
import {SharedService} from "../services/shared.service";
import { Subscription } from 'rxjs';
import {SignalrService} from "../services/signalr.service";


@Component({
  selector: 'app-main-nav',
  standalone: true,
  imports: [
    RouterLink,
    MatToolbar,
    MatButton,
    MatGridListModule,
    NgIf,
    NgOptimizedImage,
    MatMenuModule,
    AsyncPipe
  ],
  templateUrl: './main-nav.component.html',
  styleUrl: './main-nav.component.css'
})
export class MainNavComponent implements OnInit{

  clickEventsubscription :Subscription;


  public authService = inject(AuthenticationService);
  private forumService :ForumService = inject(ForumService);
  private destroyRef :DestroyRef = inject(DestroyRef)
  private router = inject(Router);
  public hasNotifications: boolean = false;
  configSuccess: MatSnackBarConfig = {
    panelClass: 'style-success',
    horizontalPosition: 'center',
    verticalPosition: 'top',

  };

  constructor(private snackBar: MatSnackBar, private sharedService:SharedService, private signalRService: SignalrService) {
    this.clickEventsubscription=    this.sharedService.getClickEvent().subscribe(()=>{
      this.checkForNotifications();
    })

  }

  ngOnInit() {
    this.forumService.hasNotifications(this.authService.getCurrentId()).subscribe(data =>{
      this.hasNotifications = data;
    })

    //real time notifications subscribe method
    this.signalRService.currentMessage.subscribe(data => {
        this.checkForNotifications();
        console.log("broadcast")
    });
  }


  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  createPost() {
    if (this.authService.isAuthenticated()){
      this.router.navigate(['/create-post'])
      this.hasNotifications = false;
    } else {
      this.snackBar.openFromComponent(CreatePostNavSnackComponent, {
        ...this.configSuccess,
      });
    }
  }

  checkForNotifications(){
    this.hasNotifications = false;
    this.forumService.hasNotifications(this.authService.getCurrentId()).subscribe(data =>{
      this.hasNotifications = data;
    })
  }

  removeNotificationsAlert(){
    this.hasNotifications = false;
  }

}

@Component({
  selector: 'main-nav-snack',
  templateUrl: 'main-nav-snack.html',
  imports: [
    MatButton
  ],
  standalone: true
})
export class CreatePostNavSnackComponent {
  private router = inject(Router);
  constructor(
    public snackBarRef: MatSnackBarRef<CreatePostNavSnackComponent>,
  ) {}


  onClick() {
    this.snackBarRef.dismiss()
    this.router.navigate(['/login'])
  }

}

