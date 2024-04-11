import {Component, inject, Inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {HttpParams} from "@angular/common/http";
import { HttpClient } from '@angular/common/http';

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
export class CreatePostComponent {
  public CreatePostForm: FormGroup;
  private httpClient = inject(HttpClient);


  constructor(private formBuilder: FormBuilder, @Inject('BASE_URL') private baseUrl: string) {
    this.CreatePostForm = this.formBuilder.group({
      title: ['', Validators.required, Validators.maxLength(50)],
      description: ['', Validators.required, Validators.maxLength(500)],
      code : ['']
    });

  }
  submitPost() {
    let parameters = new HttpParams();
    parameters = parameters.append("title", this.CreatePostForm.value.title);
    parameters = parameters.append("description", this.CreatePostForm.value.description);

    this.httpClient.post(this.baseUrl + '/forum/newPost', {params: parameters}).subscribe();
  }
}
