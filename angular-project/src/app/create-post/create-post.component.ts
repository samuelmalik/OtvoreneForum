import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {AuthenticationService} from "../api-authorization/authentication.service";
import {DestroyRef} from "@angular/core";
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from "@angular/router";
import {ForumService} from "../services/forum.service";


@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,

  ],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.css'
})
export class CreatePostComponent implements OnInit{
  public CreatePostForm: FormGroup;
  private authService = inject(AuthenticationService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private forumService :ForumService = inject(ForumService);
  private currentUserId :string;


  constructor(private formBuilder: FormBuilder, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.currentUserId = this.authService.getCurrentId();

    this.CreatePostForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.required]],
      code: ['']
    });
  }

  submitPost() {

    if(this.currentUserId == null){
      this.router.navigate(['/login']);
    }

    else if (this.CreatePostForm.valid) {
      const postData = {
        title: this.CreatePostForm.value.title,
        description: this.CreatePostForm.value.description,
        code: this.CreatePostForm.value.code,
        authorId: this.currentUserId,
      };

      this.forumService.createPost(postData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();

      this.CreatePostForm.reset();
      this.openSnackBar("Príspevok bol úspešne vytvorený");

    } else {
      this.openSnackBar("Zadali ste nesprávne informácie, príspevok sa nevytvoril")
    }
    }

  openSnackBar(message: string) {
    this.snackBar.open(message, "", {
      duration: 3000
    });
  }

  }

