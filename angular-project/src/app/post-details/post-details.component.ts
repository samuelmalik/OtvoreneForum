import {Component, inject, OnInit, DestroyRef, Signal, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {ActivatedRoute, Router} from "@angular/router";
import {
  AddCommentLikeInterface,
  AddPostLikeInterface,
  CommentInfoInterface,
  CreateCommentInterface,
  ForumService,
  PostDetailsDtoInterface
} from "../services/forum.service";
import {AuthenticationService} from "../api-authorization/authentication.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MatExpansionModule} from "@angular/material/expansion";
import {HighlightAuto} from "ngx-highlightjs";
import {HighlightLineNumbers} from "ngx-highlightjs/line-numbers";
import {MatButton} from "@angular/material/button";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatButtonModule} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";
import {SignalrService} from "../services/signalr.service";
import {MatIcon} from "@angular/material/icon";
import {DeleteDialogComponent} from "../delete-dialog/delete-dialog.component";
import {MatDialog} from "@angular/material/dialog";


@Component({
  selector: 'app-post-details',
  standalone: true,
    imports: [
        MatExpansionModule,
        HighlightAuto,
        HighlightLineNumbers,
        ReactiveFormsModule,
        MatCardModule,
        MatButton,
        MatProgressSpinner,
        MatMenuModule,
        MatButtonModule,
        MatIcon
    ],
  templateUrl: './post-details.component.html',
  styleUrl: './post-details.component.css',
})
export class PostDetailsComponent implements OnInit {
  private authService = inject(AuthenticationService);
  private forumService: ForumService = inject(ForumService);
  private destroyRef: DestroyRef = inject(DestroyRef);
  private signalRService: SignalrService = inject(SignalrService)
  private router: Router = inject(Router)
  readonly dialog = inject(MatDialog);

  public CreateCommentForm: FormGroup;
  public id: number;
  public postDetails: PostDetailsDtoInterface;
  public currentUserId :string;
  public loggedRole :string;
  //public commentList = signal<CommentInfoInterface[]>([]);
  public commentArray :CommentInfoInterface[] = [];
  public postLoading: boolean = true;
  public commentsLoading: boolean = true;
  public orderBy: string;

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.currentUserId = this.authService.getCurrentId();
    this.loggedRole = this.authService.getRole();

    const routeParams = this.route.snapshot.paramMap;
     this.id = Number(routeParams.get('postId'));
     this.forumService.getPostDetails(this.id, this.currentUserId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data =>{
       this.postDetails = data;
       this.postLoading = false
     });
     // get comments
    this.forumService.getCommentsByPost(this.currentUserId, this.id).subscribe(data => {
    //this.commentList = signal<CommentInfoInterface[]>(data);
    this.commentArray = data;
    this.orderBy = "Od najnovšieho"
    this.commentArray.sort((a, b) => b.id - a.id)
    this.commentsLoading = false
    })
    this.CreateCommentForm = this.formBuilder.group({
      message: ['', [Validators.required]],
      code: ['']
    });
  }
  changeOrder(order: string){
    if (order == "newest"){
      this.orderBy = "Od najnovšieho"
      this.commentArray.sort((a, b) => b.id - a.id)
    } else if(order == "oldest"){
      this.orderBy = "Od najstaršieho"
      this.commentArray.sort((a, b) => a.id - b.id)
    } else if(order == "most-liked"){
      this.orderBy = "Od najobľúbenejších"
      this.commentArray.sort((a, b) => b.likes - a.likes)
    } else if(order == "least-liked"){
      this.orderBy = "Od najmenej obľúbených"
      this.commentArray.sort((a, b) => a.likes - b.likes)
    }
  }

  submitPost() {
    if(this.currentUserId == null){
      console.log("Neprihlásený user");
    }

    else if (this.CreateCommentForm.valid) {
      const commentData: CreateCommentInterface = {
        message: this.CreateCommentForm.value.message,
        code: this.CreateCommentForm.value.code,
        authorId: this.currentUserId,
        postId: this.id
      };

      this.forumService.createComment(commentData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(data => {
          //this.commentList.update(items => [...items, data])
          this.commentArray.push(data)
          this.signalRService.newNotificationBroadcast();
        });
      this.CreateCommentForm.reset();
    }
  }

  onPostLike(){
    const likeData: AddPostLikeInterface = {
      userId: this.currentUserId,
      postId: this.id
    }

    if(this.currentUserId == null){
      console.log("Neprihlásený user");}

    else if(this.postDetails.isLiked == false){
      this.postDetails.isLiked = true
      this.postDetails.likes += 1
      this.forumService.addPostLike(likeData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data =>{
        this.signalRService.newNotificationBroadcast();
      })

    } else if(this.postDetails.isLiked == true){
      this.postDetails.isLiked = false
      this.postDetails.likes -= 1
      this.forumService.removePostLike(likeData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data =>{})
    }
  }

  onCommentLike(commentId: number){
    const index = this.commentArray.findIndex(comment => comment.id == commentId)
    const likeData: AddCommentLikeInterface = {
      userId: this.currentUserId,
      commentId: commentId
    }

    if(this.currentUserId == null){
      console.log("neprihlásený user");}

    else if(this.commentArray[index].isLiked == false){
      this.commentArray[index].isLiked = true
      this.commentArray[index].likes += 1
      this.forumService.addCommentLike(likeData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data =>{
        this.signalRService.newNotificationBroadcast();
      })

    } else if(this.commentArray[index].isLiked == true){
      this.commentArray[index].isLiked = false
      this.commentArray[index].likes -= 1
      this.forumService.removeCommentLike(likeData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data =>{})
    }
  }

  onDelete(id: number){
      const dialogRef = this.dialog.open(DeleteDialogComponent, {
        data: {type: "post", integerParameter: id},
        width: '40vw',
        height: 'auto',
        panelClass: 'custom-dialog-container',
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result !== undefined) {
          this.forumService.deletePost(id).subscribe({
            complete: () => {
              this.router.navigate(['/forum']);
            }
          })
        }
      });
  }

  onDeleteComment(id: number){
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: {type: "comment", integerParameter: id},
      width: '40vw',
      height: 'auto',
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.forumService.deleteComment(id).subscribe()
        this.commentArray = this.commentArray.filter(item => item.id != result)
      }
    });
  }
}
