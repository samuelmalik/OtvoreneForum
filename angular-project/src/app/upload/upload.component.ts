import { HttpClient, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {FileService} from "../services/file.service";
import {MatButtonModule} from '@angular/material/button';
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [MatButtonModule, MatIcon],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {
  fileToUpload: File;
  fileChosen: boolean;
  progress: number;
  message: string;
  formData = new FormData();
  @Output() public onUploadFinished = new EventEmitter();

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private fileService: FileService) { }
  ngOnInit() {
    this.fileChosen = false
  }

  uploadFile = (files) => {
    if (files.length === 0) {
      return;
    }
     this.fileToUpload = <File>files[0];

    this.formData.append('file', this.fileToUpload, this.fileToUpload.name);
    console.log(this.fileToUpload.name)
    //tuto spraviť aby zmizla message a nabehol názov súboru a prípadné odstránenie

    this.fileChosen = true
    this.message = ""
    this.progress = null

  }
  protected readonly event = event;

  // uploading file to BE
  uploadFileToServer(){
    this.fileService.upload(this.formData)
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress)
            this.progress = Math.round(100 * event.loaded / event.total);
          else if (event.type === HttpEventType.Response) {
            this.message = 'Upload success.';
            // trigger method in download component to save details about file to DB
            this.onUploadFinished.emit(event.body);

            //clearing form data
            this.formData = new FormData()
            this.fileChosen = false
          }
        },
        error: (err: HttpErrorResponse) => console.log(err)
      });
  }

  removeChosenFile(){
    this.formData = new FormData()
    this.fileChosen = false
  }
}
