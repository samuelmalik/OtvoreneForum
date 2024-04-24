import {Component, inject, OnInit, DestroyRef} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {ActivatedRoute} from "@angular/router";
import {
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

@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [
    MatExpansionModule,
    HighlightAuto,
    HighlightLineNumbers,
    ReactiveFormsModule,
    MatCardModule,
    MatButton
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

  constructor(private route: ActivatedRoute, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.currentUserId = this.authService.getCurrentId();

    const routeParams = this.route.snapshot.paramMap;
     this.id = Number(routeParams.get('postId'));
     this.forumService.getPostDetails(this.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data =>{
       this.postDetails = data;
     });

    this.CreateCommentForm = this.formBuilder.group({
      message: ['', [Validators.required]],
      code: ['']
    });
  }

  onCommentsOpened(){
    console.log("Komentáre otvorené")
    this.forumService.getCommentsByPost(this.currentUserId, this.id).subscribe(data => {
      console.log(data)
    })
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
        .subscribe();
      console.log(commentData)

      this.CreateCommentForm.reset();
    }
  }
}
