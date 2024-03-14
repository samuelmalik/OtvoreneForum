import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.css'
})
export class CreatePostComponent {
  public CreatePostForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.CreatePostForm = this.formBuilder.group({
      name: ['', Validators.required, Validators.maxLength(50)],
      description: ['', Validators.required, Validators.maxLength(500)],
      code : ['']
    });

  }
}
