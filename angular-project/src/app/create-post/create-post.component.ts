import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';

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

  constructor(private formBuilder: FormBuilder) {
    this.CreatePostForm = this.formBuilder.group({
      title: ['', Validators.required, Validators.maxLength(50)],
      description: ['', Validators.required, Validators.maxLength(500)],
      code : ['']
    });

  }
  submitPost() {
    console.log(this.CreatePostForm.value);
  }
}
