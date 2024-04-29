import {Component, inject, OnInit, DestroyRef, Signal, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {ActivatedRoute} from "@angular/router";
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
    MatProgressSpinner
  ],
  templateUrl: './post-details.component.html',
  styleUrl: './post-details.component.css',
})
export class PostDetailsComponent implements OnInit {
  private authService = inject(AuthenticationService);
  private forumService: ForumService = inject(ForumService);
  private destroyRef: DestroyRef = inject(DestroyRef);
  public CreateCommentForm: FormGroup;
  public id: number;
  public postDetails: PostDetailsDtoInterface;
  public currentUserId :string;
  //public commentList = signal<CommentInfoInterface[]>([]);
  public commentArray :CommentInfoInterface[] = [];
  public postLoading: boolean = true;
  public commentsLoading: boolean = true;

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.currentUserId = this.authService.getCurrentId();

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

    this.commentsLoading = false
    })


    this.CreateCommentForm = this.formBuilder.group({
      message: ['', [Validators.required]],
      code: ['']
    });
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
      console.log("Neprihlásený user");
    }else if(this.postDetails.isLiked == false){

      this.postDetails.isLiked = true
      this.postDetails.likes += 1
      this.forumService.addPostLike(likeData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data =>{})

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
      console.log("neprihlásený user");
    }else if(this.commentArray[index].isLiked == false){

      this.commentArray[index].isLiked = true
      this.commentArray[index].likes += 1
      this.forumService.addCommentLike(likeData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data =>{})

    } else if(this.commentArray[index].isLiked == true){
      this.commentArray[index].isLiked = false
      this.commentArray[index].likes -= 1
      this.forumService.removeCommentLike(likeData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data =>{})
    }

  }
}
